import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import { useTranslation } from "react-i18next";
import * as d3 from "d3";
import {
  ChartResponse,
  DualChartResponse,
  PLANET_KEYS,
  OPTIONAL_PLANET_KEYS,
  HOUSE_KEYS,
  SIGN_SYMBOLS,
  SIGN_NAMES,
  PLANET_SYMBOLS,
  ASPECT_COLORS,
  SIGN_COLORS,
  PlanetData,
} from "../types/astrology";
import type { GlossaryCategory } from "../data/glossary";

type TFunction = (key: string) => string;

export interface ChartWheelHandle {
  getSvgElement: () => SVGSVGElement | null;
}

export interface GlossaryClickEvent {
  category: GlossaryCategory;
  key: string;
}

interface Props {
  data: ChartResponse;
  transitData?: DualChartResponse | null;
  size?: number;
  onGlossaryClick?: (event: GlossaryClickEvent) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- D3 selection type helper
type D3Sel = d3.Selection<any, unknown, null, undefined>;

/** D3 の .on() overload を TS で安全に使うヘルパー */
function bindClick(sel: D3Sel, handler?: () => void): D3Sel {
  if (handler) {
    return sel.attr("cursor", "pointer").on("click", handler);
  }
  return sel;
}

// ASC（第1ハウスカスプ）を左（9時方向）に固定するオフセットを計算
function ascOffset(ascAbsPos: number): number {
  return 180 - ascAbsPos;
}

// 黄経 → SVG上の角度（ASC=左固定、反時計回り）
function toAngle(absPos: number, offset: number): number {
  return -(absPos + offset);
}

// 角度 → SVG座標
function polarToXY(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) };
}

const ChartWheel = forwardRef<ChartWheelHandle, Props>(function ChartWheel({ data, transitData, size = 600, onGlossaryClick }, ref) {
  const { t } = useTranslation();
  const svgRef = useRef<SVGSVGElement>(null);
  const glossaryCallbackRef = useRef(onGlossaryClick);
  glossaryCallbackRef.current = onGlossaryClick;

  useImperativeHandle(ref, () => ({
    getSvgElement: () => svgRef.current,
  }));

  useEffect(() => {
    if (!svgRef.current || !data) return;
    const cb = (e: GlossaryClickEvent) => glossaryCallbackRef.current?.(e);
    drawChart(svgRef.current, data, size, t, transitData ?? undefined, cb);
  }, [data, transitData, size, t]);

  return (
    <svg
      ref={svgRef}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="mx-auto"
    />
  );
});

export default ChartWheel;

function drawChart(svg: SVGSVGElement, data: ChartResponse, size: number, t: TFunction, transitData?: DualChartResponse, onGlossary?: (e: GlossaryClickEvent) => void) {
  const sel = d3.select(svg);
  sel.selectAll("*").remove();

  const cx = size / 2;
  const cy = size / 2;
  const hasTransit = !!transitData;

  // トランジットモードではリングを少し縮小して外側にトランジット天体を配置
  const outerR = hasTransit ? size * 0.42 : size * 0.46;
  const signR = hasTransit ? size * 0.35 : size * 0.38;
  const houseR = size * 0.30;
  const innerR = size * 0.15;
  const planetR = hasTransit ? size * 0.30 : size * 0.34;
  const transitOuterR = size * 0.46;
  const transitPlanetR = size * 0.43;

  const subject = data.subject;
  const offset = ascOffset(subject.first_house.abs_pos);

  const g = sel.append("g");

  // Background (outer circle matches transit or natal)
  g.append("circle")
    .attr("cx", cx).attr("cy", cy).attr("r", hasTransit ? transitOuterR : outerR)
    .attr("fill", "#1a1a2e").attr("stroke", "#334").attr("stroke-width", 1);

  // Transit outer ring boundary
  if (hasTransit) {
    g.append("circle")
      .attr("cx", cx).attr("cy", cy).attr("r", outerR)
      .attr("fill", "none").attr("stroke", "#446").attr("stroke-width", 0.5)
      .attr("stroke-dasharray", "3,3");
  }

  // === Sign ring ===
  drawSignRing(g, cx, cy, outerR, signR, offset, onGlossary);

  // === House ring ===
  drawHouseLines(g, cx, cy, signR, innerR, subject, offset, onGlossary);

  // === Inner circle ===
  g.append("circle")
    .attr("cx", cx).attr("cy", cy).attr("r", innerR)
    .attr("fill", "#111122").attr("stroke", "#445").attr("stroke-width", 1);

  // === Aspect lines ===
  if (hasTransit) {
    // Transit mode: draw transit cross-aspects
    drawAspects(g, cx, cy, innerR * 0.95, transitData.aspects, offset, t, onGlossary);
  } else {
    drawAspects(g, cx, cy, innerR * 0.95, data.aspects, offset, t, onGlossary);
  }

  // === Natal Planets ===
  drawPlanets(g, cx, cy, planetR, houseR, subject, offset, t, onGlossary);

  // === Transit Planets (outer ring) ===
  if (hasTransit) {
    drawTransitPlanets(g, cx, cy, transitPlanetR, outerR, transitData.second_subject, offset, t);
  }
}

function drawTransitPlanets(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  cx: number, cy: number,
  planetR: number, innerR: number,
  subject: DualChartResponse["second_subject"],
  offset: number,
  t: TFunction,
) {
  const planets = PLANET_KEYS.map((k) => subject[k] as PlanetData);
  for (const k of OPTIONAL_PLANET_KEYS) {
    const p = subject[k] as PlanetData | null;
    if (p) planets.push(p);
  }

  const sorted = planets.map((p) => ({
    ...p,
    displayAngle: toAngle(p.abs_pos, offset),
  }));
  sorted.sort((a, b) => a.abs_pos - b.abs_pos);

  const minGap = 8;
  for (let i = 1; i < sorted.length; i++) {
    let diff = sorted[i].abs_pos - sorted[i - 1].abs_pos;
    if (diff < 0) diff += 360;
    if (diff < minGap) {
      sorted[i].displayAngle = sorted[i - 1].displayAngle - minGap;
    }
  }

  for (const p of sorted) {
    const symbol = PLANET_SYMBOLS[p.name] || p.name.slice(0, 2);
    const pos = polarToXY(cx, cy, planetR, p.displayAngle);

    // Tick line
    const tickStart = polarToXY(cx, cy, innerR, toAngle(p.abs_pos, offset));
    const tickEnd = polarToXY(cx, cy, planetR * 0.95, p.displayAngle);
    g.append("line")
      .attr("x1", tickStart.x).attr("y1", tickStart.y)
      .attr("x2", tickEnd.x).attr("y2", tickEnd.y)
      .attr("stroke", "#664")
      .attr("stroke-width", 0.4);

    // Planet symbol (transit = amber color)
    const planetName = t("planets." + p.name) || p.name;
    const signName = SIGN_NAMES[p.sign] || p.sign;
    const deg = Math.floor(p.position);
    const min = Math.floor((p.position - deg) * 60);
    const retroLabel = p.retrograde ? ` ${t("chart.retrograde")}` : "";
    const tooltip = `${t("chart.transitPrefix")}${planetName}  ${signName} ${deg}°${min.toString().padStart(2, "0")}'${retroLabel}`;

    const planetText = g.append("text")
      .attr("x", pos.x).attr("y", pos.y)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .attr("fill", "#f0c040")
      .attr("font-size", planetR * 0.08)
      .attr("font-weight", "bold")
      .attr("cursor", "default")
      .text(symbol);
    planetText.append("title").text(tooltip);

    if (p.retrograde) {
      const rPos = polarToXY(cx, cy, planetR * 1.05, p.displayAngle);
      g.append("text")
        .attr("x", rPos.x).attr("y", rPos.y)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .attr("fill", "#f88")
        .attr("font-size", planetR * 0.04)
        .text("R");
    }
  }
}

function drawSignRing(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  cx: number, cy: number,
  outerR: number, innerR: number,
  offset: number,
  onGlossary?: (e: GlossaryClickEvent) => void,
) {
  const signs = ["Ari","Tau","Gem","Can","Leo","Vir","Lib","Sco","Sag","Cap","Aqu","Pis"];

  for (let i = 0; i < 12; i++) {
    const startAbs = i * 30;
    const endAbs = (i + 1) * 30;
    const startAng = toAngle(startAbs, offset);
    const endAng = toAngle(endAbs, offset);

    // Sign sector
    const arc = d3.arc<unknown>()
      .innerRadius(innerR)
      .outerRadius(outerR)
      .startAngle((-startAng + 90) * Math.PI / 180)
      .endAngle((-endAng + 90) * Math.PI / 180);

    const signKey = signs[i];
    const sectorPath = g.append("path")
      .attr("d", arc as unknown as string)
      .attr("transform", `translate(${cx},${cy})`)
      .attr("fill", SIGN_COLORS[i])
      .attr("opacity", 0.15)
      .attr("stroke", "#445")
      .attr("stroke-width", 0.5);
    bindClick(sectorPath, onGlossary ? () => onGlossary({ category: "sign", key: signKey }) : undefined);

    // Sign symbol
    const midAng = toAngle(startAbs + 15, offset);
    const labelR = (outerR + innerR) / 2;
    const pos = polarToXY(cx, cy, labelR, midAng);
    const signText = g.append("text")
      .attr("x", pos.x).attr("y", pos.y)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .attr("fill", SIGN_COLORS[i])
      .attr("font-size", outerR * 0.08)
      .attr("opacity", 0.8)
      .text(SIGN_SYMBOLS[signs[i]]);
    bindClick(signText, onGlossary ? () => onGlossary({ category: "sign", key: signKey }) : undefined);
  }
}

function drawHouseLines(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  cx: number, cy: number,
  outerR: number, innerR: number,
  subject: ChartResponse["subject"],
  offset: number,
  onGlossary?: (e: GlossaryClickEvent) => void,
) {
  const houses = HOUSE_KEYS.map((k) => subject[k] as { abs_pos: number; name: string });

  for (let i = 0; i < 12; i++) {
    const ang = toAngle(houses[i].abs_pos, offset);
    const p1 = polarToXY(cx, cy, innerR, ang);
    const p2 = polarToXY(cx, cy, outerR, ang);

    const isAngle = i === 0 || i === 3 || i === 6 || i === 9;
    g.append("line")
      .attr("x1", p1.x).attr("y1", p1.y)
      .attr("x2", p2.x).attr("y2", p2.y)
      .attr("stroke", isAngle ? "#889" : "#445")
      .attr("stroke-width", isAngle ? 1.5 : 0.5);

    // House number
    const nextIdx = (i + 1) % 12;
    let midAbs = (houses[i].abs_pos + houses[nextIdx].abs_pos) / 2;
    if (houses[nextIdx].abs_pos < houses[i].abs_pos) {
      midAbs = ((houses[i].abs_pos + houses[nextIdx].abs_pos + 360) / 2) % 360;
    }
    const midAng = toAngle(midAbs, offset);
    const numR = (outerR + innerR) / 2;
    const numPos = polarToXY(cx, cy, numR, midAng);
    const houseNum = i + 1;
    const houseText = g.append("text")
      .attr("x", numPos.x).attr("y", numPos.y)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .attr("fill", "#667")
      .attr("font-size", outerR * 0.05)
      .text(houseNum);
    bindClick(houseText, onGlossary ? () => onGlossary({ category: "house", key: String(houseNum) }) : undefined);
  }
}

function drawAspects(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  cx: number, cy: number,
  r: number,
  aspects: ChartResponse["aspects"],
  offset: number,
  t: TFunction,
  onGlossary?: (e: GlossaryClickEvent) => void,
) {
  // Only draw major aspects with tight orbs
  const majorAspects = aspects.filter(
    (a) => a.aspect in ASPECT_COLORS && a.orbit < 8
  );

  const aspectI18nKeys: Record<string, string> = {
    conjunction: "aspects.conjunction",
    opposition: "aspects.opposition",
    trine: "aspects.trine",
    sextile: "aspects.sextile",
    square: "aspects.square",
    semi_square: "aspects.semi_square",
    quincunx: "aspects.quincunx",
  };

  for (const a of majorAspects) {
    const ang1 = toAngle(a.p1_abs_pos, offset);
    const ang2 = toAngle(a.p2_abs_pos, offset);
    const p1 = polarToXY(cx, cy, r, ang1);
    const p2 = polarToXY(cx, cy, r, ang2);

    const opacity = Math.max(0.15, 0.6 - a.orbit * 0.06);
    const aspectKey = a.aspect;
    const aspectLine = g.append("line")
      .attr("x1", p1.x).attr("y1", p1.y)
      .attr("x2", p2.x).attr("y2", p2.y)
      .attr("stroke", ASPECT_COLORS[a.aspect] || "#555")
      .attr("stroke-width", onGlossary ? 2.5 : 0.8)
      .attr("opacity", opacity);
    bindClick(aspectLine, onGlossary ? () => onGlossary({ category: "aspect", key: aspectKey }) : undefined);
    const p1Name = t("planets." + a.p1_name) || a.p1_name;
    const p2Name = t("planets." + a.p2_name) || a.p2_name;
    const aspectName = aspectI18nKeys[a.aspect] ? t(aspectI18nKeys[a.aspect]) : a.aspect;
    aspectLine.append("title").text(`${p1Name} ${aspectName} ${p2Name}  ${t("chart.orb")}${a.orbit.toFixed(1)}°`);
  }
}

function drawPlanets(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  cx: number, cy: number,
  planetR: number, innerR: number,
  subject: ChartResponse["subject"],
  offset: number,
  t: TFunction,
  onGlossary?: (e: GlossaryClickEvent) => void,
) {
  const planets = PLANET_KEYS.map((k) => subject[k] as PlanetData);
  for (const k of OPTIONAL_PLANET_KEYS) {
    const p = subject[k] as PlanetData | null;
    if (p) planets.push(p);
  }
  // Add ASC and MC
  planets.push(subject.ascendant as PlanetData);
  planets.push(subject.medium_coeli as PlanetData);

  // Sort by abs_pos and spread overlapping planets
  const sorted = planets.map((p) => ({
    ...p,
    displayAngle: toAngle(p.abs_pos, offset),
  }));
  sorted.sort((a, b) => a.abs_pos - b.abs_pos);

  // Spread overlapping (within 6 degrees)
  const minGap = 8;
  for (let i = 1; i < sorted.length; i++) {
    let diff = sorted[i].abs_pos - sorted[i - 1].abs_pos;
    if (diff < 0) diff += 360;
    if (diff < minGap) {
      sorted[i].displayAngle = sorted[i - 1].displayAngle - minGap;
    }
  }

  for (const p of sorted) {
    const symbol = PLANET_SYMBOLS[p.name] || p.name.slice(0, 2);
    const pos = polarToXY(cx, cy, planetR, p.displayAngle);

    // Tick line from inner ring to planet
    const tickStart = polarToXY(cx, cy, innerR, toAngle(p.abs_pos, offset));
    const tickEnd = polarToXY(cx, cy, planetR * 0.92, p.displayAngle);
    g.append("line")
      .attr("x1", tickStart.x).attr("y1", tickStart.y)
      .attr("x2", tickEnd.x).attr("y2", tickEnd.y)
      .attr("stroke", "#556")
      .attr("stroke-width", 0.5);

    // Planet symbol with tooltip
    const planetName = t("planets." + p.name) || p.name;
    const signName = SIGN_NAMES[p.sign] || p.sign;
    const deg = Math.floor(p.position);
    const min = Math.floor((p.position - deg) * 60);
    const houseNum = p.house ? p.house.replace("_House", "").replace("_", " ") : "";
    const retroLabel = p.retrograde ? ` ${t("chart.retrograde")}` : "";
    const tooltip = `${planetName}  ${signName} ${deg}°${min.toString().padStart(2, "0")}'  ${houseNum ? `${t("chart.housePrefix")}${houseNum}${t("chart.houseSuffix")}` : ""}${retroLabel}`;

    const pKey = p.name;
    const planetText = g.append("text")
      .attr("x", pos.x).attr("y", pos.y)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .attr("fill", "#e8e8f0")
      .attr("font-size", planetR * 0.1)
      .attr("font-weight", "bold")
      .text(symbol);
    bindClick(planetText, onGlossary ? () => onGlossary({ category: "planet", key: pKey }) : undefined);
    planetText.append("title").text(tooltip);

    // Retrograde indicator
    if (p.retrograde) {
      const rPos = polarToXY(cx, cy, planetR * 1.06, p.displayAngle);
      g.append("text")
        .attr("x", rPos.x).attr("y", rPos.y)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .attr("fill", "#f88")
        .attr("font-size", planetR * 0.05)
        .text("R");
    }
  }
}
