"""月間トランジットカレンダー: 日ごとのイベント検出ロジック。"""

from __future__ import annotations

import calendar
from dataclasses import dataclass, asdict
from typing import Any

from kerykeion import AstrologicalSubjectFactory


# 検出対象の天体
TRANSIT_PLANETS = [
    "sun", "moon", "mercury", "venus", "mars",
    "jupiter", "saturn", "uranus", "neptune", "pluto",
]

# ネイタルとのアスペクト検出対象（遅い天体のみ）
ASPECT_TRANSIT_PLANETS = [
    "sun", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto",
]

NATAL_PLANETS = [
    "sun", "moon", "mercury", "venus", "mars",
    "jupiter", "saturn", "uranus", "neptune", "pluto",
    "ascendant", "medium_coeli",
]

# アスペクト定義（角度, 名前, オーブ）
ASPECTS = [
    (0, "conjunction", 6),
    (60, "sextile", 4),
    (90, "square", 5),
    (120, "trine", 5),
    (180, "opposition", 6),
]

SIGN_NAMES = [
    "Ari", "Tau", "Gem", "Can", "Leo", "Vir",
    "Lib", "Sco", "Sag", "Cap", "Aqu", "Pis",
]

PLANET_NAMES_JA: dict[str, str] = {
    "sun": "太陽", "moon": "月", "mercury": "水星", "venus": "金星",
    "mars": "火星", "jupiter": "木星", "saturn": "土星", "uranus": "天王星",
    "neptune": "海王星", "pluto": "冥王星",
    "ascendant": "ASC", "medium_coeli": "MC",
}

SIGN_NAMES_JA: dict[str, str] = {
    "Ari": "牡羊座", "Tau": "牡牛座", "Gem": "双子座", "Can": "蟹座",
    "Leo": "獅子座", "Vir": "乙女座", "Lib": "天秤座", "Sco": "蠍座",
    "Sag": "射手座", "Cap": "山羊座", "Aqu": "水瓶座", "Pis": "魚座",
}

ASPECT_NAMES_JA: dict[str, str] = {
    "conjunction": "合", "sextile": "セクスタイル",
    "square": "スクエア", "trine": "トライン", "opposition": "オポジション",
}


@dataclass
class CalendarEvent:
    """カレンダーイベント。"""
    type: str          # "new_moon" | "full_moon" | "ingress" | "retrograde" | "direct" | "natal_aspect"
    planet: str        # 天体名 (kerykeion key)
    description: str   # 日本語の説明
    detail: str = ""   # 追加情報（サイン名、アスペクト種別など）


@dataclass
class CalendarDay:
    """1日分のカレンダーデータ。"""
    day: int
    weekday: int  # 0=月曜 ... 6=日曜
    events: list[CalendarEvent]


def _get_planet(subject: Any, key: str) -> Any:
    """サブジェクトから天体オブジェクトを取得。"""
    return getattr(subject, key, None)


def _angle_diff(a: float, b: float) -> float:
    """2つの黄経の最小角度差（0〜180）。"""
    d = abs(a - b) % 360
    return d if d <= 180 else 360 - d


def _detect_moon_phase(
    prev_sun_pos: float, prev_moon_pos: float,
    curr_sun_pos: float, curr_moon_pos: float,
) -> str | None:
    """前日→当日で新月/満月の境界を通過したか検出。"""
    # 月-太陽の角度差
    def moon_sun_diff(moon: float, sun: float) -> float:
        return (moon - sun) % 360

    prev_diff = moon_sun_diff(prev_moon_pos, prev_sun_pos)
    curr_diff = moon_sun_diff(curr_moon_pos, curr_sun_pos)

    # 新月: 差が 0度 を跨ぐ (350+ → 0-10)
    if prev_diff > 340 and curr_diff < 20:
        return "new_moon"
    # 満月: 差が 180度 を跨ぐ (170-180 → 180-190)
    if prev_diff < 180 and curr_diff >= 180:
        return "full_moon"
    return None


def compute_monthly_calendar(
    name: str, year: int, month: int, day: int, hour: int, minute: int,
    lat: float, lng: float, tz_str: str, house_system: str,
    cal_year: int, cal_month: int,
) -> dict:
    """月間カレンダーを計算して返す。"""
    # ネイタルサブジェクト
    natal = AstrologicalSubjectFactory.from_birth_data(
        name, year, month, day, hour, minute,
        lat=lat, lng=lng, tz_str=tz_str, online=False,
        houses_system_identifier=house_system,
    )

    # ネイタル天体の絶対位置を取得
    natal_positions: dict[str, float] = {}
    for key in NATAL_PLANETS:
        p = _get_planet(natal, key)
        if p and hasattr(p, "abs_pos"):
            natal_positions[key] = p.abs_pos

    # 対象月の日数
    num_days = calendar.monthrange(cal_year, cal_month)[1]

    # 各日のトランジットサブジェクトを生成（正午）
    transit_subjects: list[Any] = []
    for d in range(1, num_days + 1):
        subj = AstrologicalSubjectFactory.from_birth_data(
            "Transit", cal_year, cal_month, d, 12, 0,
            lat=lat, lng=lng, tz_str=tz_str, online=False,
            houses_system_identifier=house_system,
        )
        transit_subjects.append(subj)

    # 前月最終日（前日比較用）
    if cal_month == 1:
        prev_year, prev_month = cal_year - 1, 12
    else:
        prev_year, prev_month = cal_year, cal_month - 1
    prev_last_day = calendar.monthrange(prev_year, prev_month)[1]
    prev_day_subject = AstrologicalSubjectFactory.from_birth_data(
        "Transit", prev_year, prev_month, prev_last_day, 12, 0,
        lat=lat, lng=lng, tz_str=tz_str, online=False,
        houses_system_identifier=house_system,
    )

    days: list[dict] = []

    for i, subj in enumerate(transit_subjects):
        prev_subj = prev_day_subject if i == 0 else transit_subjects[i - 1]
        day_num = i + 1
        # weekday: 0=月 ... 6=日
        wd = calendar.weekday(cal_year, cal_month, day_num)
        events: list[CalendarEvent] = []

        # --- 月相検出 ---
        curr_sun = _get_planet(subj, "sun")
        curr_moon = _get_planet(subj, "moon")
        prev_sun = _get_planet(prev_subj, "sun")
        prev_moon = _get_planet(prev_subj, "moon")

        if curr_sun and curr_moon and prev_sun and prev_moon:
            phase = _detect_moon_phase(
                prev_sun.abs_pos, prev_moon.abs_pos,
                curr_sun.abs_pos, curr_moon.abs_pos,
            )
            if phase == "new_moon":
                sign_ja = SIGN_NAMES_JA.get(curr_moon.sign, curr_moon.sign)
                events.append(CalendarEvent(
                    type="new_moon", planet="moon",
                    description=f"新月（{sign_ja}）",
                    detail=curr_moon.sign,
                ))
            elif phase == "full_moon":
                sign_ja = SIGN_NAMES_JA.get(curr_moon.sign, curr_moon.sign)
                events.append(CalendarEvent(
                    type="full_moon", planet="moon",
                    description=f"満月（{sign_ja}）",
                    detail=curr_moon.sign,
                ))

        # --- サインイングレス検出 ---
        for key in TRANSIT_PLANETS:
            curr_p = _get_planet(subj, key)
            prev_p = _get_planet(prev_subj, key)
            if not curr_p or not prev_p:
                continue

            if curr_p.sign != prev_p.sign:
                pname = PLANET_NAMES_JA.get(key, key)
                sign_ja = SIGN_NAMES_JA.get(curr_p.sign, curr_p.sign)
                events.append(CalendarEvent(
                    type="ingress", planet=key,
                    description=f"{pname}が{sign_ja}に移動",
                    detail=curr_p.sign,
                ))

        # --- 逆行/順行切り替え検出 ---
        for key in TRANSIT_PLANETS:
            if key == "moon":
                continue  # 月は逆行しない
            curr_p = _get_planet(subj, key)
            prev_p = _get_planet(prev_subj, key)
            if not curr_p or not prev_p:
                continue
            if curr_p.retrograde is None or prev_p.retrograde is None:
                continue

            if curr_p.retrograde and not prev_p.retrograde:
                pname = PLANET_NAMES_JA.get(key, key)
                events.append(CalendarEvent(
                    type="retrograde", planet=key,
                    description=f"{pname}逆行開始",
                ))
            elif not curr_p.retrograde and prev_p.retrograde:
                pname = PLANET_NAMES_JA.get(key, key)
                events.append(CalendarEvent(
                    type="direct", planet=key,
                    description=f"{pname}順行へ",
                ))

        # --- ネイタル天体とのアスペクト検出（当日にexact付近） ---
        for t_key in ASPECT_TRANSIT_PLANETS:
            curr_t = _get_planet(subj, t_key)
            prev_t = _get_planet(prev_subj, t_key)
            if not curr_t or not prev_t:
                continue

            for n_key, n_pos in natal_positions.items():
                if t_key == n_key and t_key != "sun":
                    continue  # 同天体のアスペクトは太陽以外スキップ

                for angle, asp_name, orb in ASPECTS:
                    curr_diff = _angle_diff(curr_t.abs_pos, n_pos)
                    prev_diff = _angle_diff(prev_t.abs_pos, n_pos)
                    curr_delta = abs(curr_diff - angle)
                    prev_delta = abs(prev_diff - angle)

                    # exactに近づいた日（1度以内かつ前日より近い）
                    if curr_delta <= 1.0 and curr_delta <= prev_delta:
                        t_name = PLANET_NAMES_JA.get(t_key, t_key)
                        n_name = PLANET_NAMES_JA.get(n_key, n_key)
                        asp_ja = ASPECT_NAMES_JA.get(asp_name, asp_name)
                        events.append(CalendarEvent(
                            type="natal_aspect", planet=t_key,
                            description=f"T.{t_name}とN.{n_name}の{asp_ja}",
                            detail=asp_name,
                        ))

        days.append({
            "day": day_num,
            "weekday": wd,
            "events": [asdict(e) for e in events],
        })

    return {
        "year": cal_year,
        "month": cal_month,
        "num_days": num_days,
        "first_weekday": calendar.weekday(cal_year, cal_month, 1),
        "days": days,
    }
