import { useEffect, useRef } from "react";
import * as d3 from "d3";
import {
  ChartResponse,
  PLANET_KEYS,
  HOUSE_KEYS,
  SIGN_SYMBOLS,
  PLANET_SYMBOLS,
  ASPECT_COLORS,
  SIGN_COLORS,
  PlanetData,
} from "../types/astrology";

interface Props {
  data: ChartResponse;
  size?: number;
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

export default function ChartWheel({ data, size = 600 }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data) return;
    drawChart(svgRef.current, data, size);
  }, [data, size]);

  return (
    <svg
      ref={svgRef}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="mx-auto"
    />
  );
}

function drawChart(svg: SVGSVGElement, data: ChartResponse, size: number) {
  const sel = d3.select(svg);
  sel.selectAll("*").remove();

  const cx = size / 2;
  const cy = size / 2;
  const outerR = size * 0.46;
  const signR = size * 0.38;
  const houseR = size * 0.30;
  const innerR = size * 0.15;
  const planetR = size * 0.34;

  const subject = data.subject;
  const offset = ascOffset(subject.first_house.abs_pos);

  const g = sel.append("g");

  // Background
  g.append("circle")
    .attr("cx", cx).attr("cy", cy).attr("r", outerR)
    .attr("fill", "#1a1a2e").attr("stroke", "#334").attr("stroke-width", 1);

  // === Sign ring (outer) ===
  drawSignRing(g, cx, cy, outerR, signR, offset);

  // === House ring ===
  drawHouseLines(g, cx, cy, signR, innerR, subject, offset);

  // === Inner circle ===
  g.append("circle")
    .attr("cx", cx).attr("cy", cy).attr("r", innerR)
    .attr("fill", "#111122").attr("stroke", "#445").attr("stroke-width", 1);

  // === Aspect lines ===
  drawAspects(g, cx, cy, innerR * 0.95, data.aspects, offset);

  // === Planets ===
  drawPlanets(g, cx, cy, planetR, houseR, subject, offset);
}

function drawSignRing(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  cx: number, cy: number,
  outerR: number, innerR: number,
  offset: number,
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

    g.append("path")
      .attr("d", arc as unknown as string)
      .attr("transform", `translate(${cx},${cy})`)
      .attr("fill", SIGN_COLORS[i])
      .attr("opacity", 0.15)
      .attr("stroke", "#445")
      .attr("stroke-width", 0.5);

    // Sign symbol
    const midAng = toAngle(startAbs + 15, offset);
    const labelR = (outerR + innerR) / 2;
    const pos = polarToXY(cx, cy, labelR, midAng);
    g.append("text")
      .attr("x", pos.x).attr("y", pos.y)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .attr("fill", SIGN_COLORS[i])
      .attr("font-size", outerR * 0.08)
      .attr("opacity", 0.8)
      .text(SIGN_SYMBOLS[signs[i]]);
  }
}

function drawHouseLines(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  cx: number, cy: number,
  outerR: number, innerR: number,
  subject: ChartResponse["subject"],
  offset: number,
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
    g.append("text")
      .attr("x", numPos.x).attr("y", numPos.y)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .attr("fill", "#667")
      .attr("font-size", outerR * 0.05)
      .text(i + 1);
  }
}

function drawAspects(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  cx: number, cy: number,
  r: number,
  aspects: ChartResponse["aspects"],
  offset: number,
) {
  // Only draw major aspects with tight orbs
  const majorAspects = aspects.filter(
    (a) => a.aspect in ASPECT_COLORS && a.orbit < 8
  );

  for (const a of majorAspects) {
    const ang1 = toAngle(a.p1_abs_pos, offset);
    const ang2 = toAngle(a.p2_abs_pos, offset);
    const p1 = polarToXY(cx, cy, r, ang1);
    const p2 = polarToXY(cx, cy, r, ang2);

    const opacity = Math.max(0.15, 0.6 - a.orbit * 0.06);
    g.append("line")
      .attr("x1", p1.x).attr("y1", p1.y)
      .attr("x2", p2.x).attr("y2", p2.y)
      .attr("stroke", ASPECT_COLORS[a.aspect] || "#555")
      .attr("stroke-width", 0.8)
      .attr("opacity", opacity);
  }
}

function drawPlanets(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  cx: number, cy: number,
  planetR: number, innerR: number,
  subject: ChartResponse["subject"],
  offset: number,
) {
  const planets = PLANET_KEYS.map((k) => subject[k] as PlanetData);
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

    // Planet symbol
    g.append("text")
      .attr("x", pos.x).attr("y", pos.y)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .attr("fill", "#e8e8f0")
      .attr("font-size", planetR * 0.1)
      .attr("font-weight", "bold")
      .text(symbol);

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
