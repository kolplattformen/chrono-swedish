import { OpUnitType } from "dayjs";
import { matchAnyPattern } from "../../utils/pattern";
import { findMostLikelyADYear } from "../../calculation/years";
import { TimeUnits } from "../../utils/timeunits";

export const WEEKDAY_DICTIONARY: { [word: string]: number } = {
    "söndag": 0,
    "sön": 0,
    "sö": 0,
    "måndag": 1,
    "mån": 1,
    "må": 1,
    "tisdag": 2,
    "tis": 2,
    "ti": 2,
    "onsdag": 3,
    "ons": 3,
    "on": 3,
    "torsdag": 4,
    "tor": 4,
    "to": 4,
    "fredag": 5,
    "fr": 5,
    "fre": 5,
    "lördag": 6,
    "lör": 6,
    "lö": 6,
};

export const MONTH_DICTIONARY: { [word: string]: number } = {
    "januari": 1,
    "jan": 1,
    "jan.": 1,
    "februari": 2,
    "feb": 2,
    "feb.": 2,
    "mars": 3,
    "mar": 3,
    "april": 4,
    "apr": 4,
    "apr.": 4,
    "maj": 5,
    "juni": 6,
    "jun": 6,
    "jun.": 6,
    "juli": 7,
    "jul": 7,
    "jul.": 7,
    "augusti": 8,
    "aug": 8,
    "aug.": 8,
    "september": 9,
    "sep": 9,
    "sep.": 9,
    "sept": 9,
    "sept.": 9,
    "oktober": 10,
    "okt": 10,
    "okt.": 10,
    "november": 11,
    "nov": 11,
    "nov.": 11,
    "december": 12,
    "dec": 12,
    "dec.": 12,
};

export const INTEGER_WORD_DICTIONARY: { [word: string]: number } = {
    "en": 1,
    "första": 1,
    "två": 2,
    "andra": 2,
    "tre": 3,
    "tredje": 3,
    "fyra": 4,
    "fjärde": 4,
    "fem": 5,
    "femte": 5,
    "sex": 6,
    "sjätte": 6,
    "sju": 7,
    "sjunde": 7,
    "åtta": 8,
    "åttonde": 8,
    "nio": 9,
    "nionde": 9,
    "tio": 10,
    "tionde": 10,
    "elva": 11,
    "elfte": 11,
    "tolv": 12,
    "tolfte": 12,
};

export const TIME_UNIT_DICTIONARY: { [word: string]: OpUnitType } = {
    sec: "second",
    second: "second",
    seconds: "second",
    min: "minute",
    mins: "minute",
    minute: "minute",
    minutes: "minute",
    h: "hour",
    hr: "hour",
    hrs: "hour",
    hour: "hour",
    hours: "hour",
    day: "d",
    days: "d",
    week: "week",
    weeks: "week",
    month: "month",
    months: "month",
    y: "year",
    yr: "year",
    year: "year",
    years: "year",
};

//-----------------------------

export const NUMBER_PATTERN = `(?:${matchAnyPattern(
    INTEGER_WORD_DICTIONARY
)}|[0-9]+|[0-9]+\\.[0-9]+|half(?:\\s*an?)?|an?(?:\\s*few)?|few|several|a?\\s*couple\\s*(?:of)?)`;

export function parseNumberPattern(match: string): number {
    const num = match.toLowerCase();
    if (INTEGER_WORD_DICTIONARY[num] !== undefined) {
        return INTEGER_WORD_DICTIONARY[num];
    } else if (num === "a" || num === "an") {
        return 1;
    } else if (num.match(/few/)) {
        return 3;
    } else if (num.match(/half/)) {
        return 0.5;
    } else if (num.match(/couple/)) {
        return 2;
    } else if (num.match(/several/)) {
        return 7;
    }

    return parseFloat(num);
}

//-----------------------------

export const YEAR_PATTERN = `(?:[0-9]{1,4}(?:\\s*[ef]\\.?\\s*kr?\\.?)?)`;
export function parseYear(match: string): number {
    if (/f/i.test(match)) {
        // f.Kr.
        return -parseInt(match.replace(/[^0-9]+/gi, ""));
    }

    if (/e/i.test(match)) {
        // e.Kr.
        return parseInt(match.replace(/[^0-9]+/gi, ""));
    }

    const rawYearNumber = parseInt(match);
    return findMostLikelyADYear(rawYearNumber);
}

//-----------------------------

const SINGLE_TIME_UNIT_PATTERN = `(${NUMBER_PATTERN})\\s*(${matchAnyPattern(TIME_UNIT_DICTIONARY)})\\s*`;
const SINGLE_TIME_UNIT_REGEX = new RegExp(SINGLE_TIME_UNIT_PATTERN, "i");

const SINGLE_TIME_UNIT_PATTERN_NO_CAPTURE = SINGLE_TIME_UNIT_PATTERN.replace(/\((?!\?)/g, "(?:");

export const TIME_UNITS_PATTERN =
    `(?:(?:runt|cirka)\\s*)?` +
    `${SINGLE_TIME_UNIT_PATTERN_NO_CAPTURE}\\s*(?:,?\\s*${SINGLE_TIME_UNIT_PATTERN_NO_CAPTURE})*`;

export function parseTimeUnits(timeunitText): TimeUnits {
    const fragments = {};
    let remainingText = timeunitText;
    let match = SINGLE_TIME_UNIT_REGEX.exec(remainingText);
    while (match) {
        collectDateTimeFragment(fragments, match);
        remainingText = remainingText.substring(match[0].length);
        match = SINGLE_TIME_UNIT_REGEX.exec(remainingText);
    }
    return fragments;
}

function collectDateTimeFragment(fragments, match) {
    const num = parseNumberPattern(match[1]);
    const unit = TIME_UNIT_DICTIONARY[match[2].toLowerCase()];
    fragments[unit] = num;
}
