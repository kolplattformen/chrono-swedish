import { includeCommonConfiguration } from "../../configurations";
import { ParsedResult, ParsingOption } from "../../index";
import { Chrono, Configuration } from "../../chrono";
import SlashDateFormatParser from "../../common/parsers/SlashDateFormatParser";
import ISOFormatParser from "../../common/parsers/ISOFormatParser";
import SVTimeExpressionParser from "./parsers/SVTimeExpressionParser";
import SVWeekdayParser from "./parsers/SVWeekdayParser";
import SVMergeDateRangeRefiner from "./refiners/SVMergeDateRangeRefiner";
import SVMergeDateTimeRefiner from "./refiners/SVMergeDateTimeRefiner";
import SVCasualDateParser from "./parsers/SVCasualDateParser";
import SVCasualTimeParser from "./parsers/SVCasualTimeParser";
import SVMonthNameLittleEndianParser from "./parsers/SVMonthNameLittleEndianParser";

// Shortcuts
export const casual = new Chrono(createCasualConfiguration());
export const strict = new Chrono(createConfiguration(true));

export function parse(text: string, ref?: Date, option?: ParsingOption): ParsedResult[] {
    return casual.parse(text, ref, option);
}

export function parseDate(text: string, ref?: Date, option?: ParsingOption): Date {
    return casual.parseDate(text, ref, option);
}

export function createCasualConfiguration(littleEndian = true): Configuration {
    const option = createConfiguration(false, littleEndian);
    option.parsers.unshift(new SVCasualTimeParser());
    option.parsers.unshift(new SVCasualDateParser());
    return option;
}

export function createConfiguration(strictMode = true, littleEndian = true): Configuration {
    return includeCommonConfiguration(
        {
            parsers: [
                new ISOFormatParser(),
                new SlashDateFormatParser(littleEndian),
                new SVTimeExpressionParser(),
                new SVMonthNameLittleEndianParser(),
                new SVWeekdayParser(),
            ],
            refiners: [new SVMergeDateRangeRefiner(), new SVMergeDateTimeRefiner()],
        },
        strictMode
    );
}
