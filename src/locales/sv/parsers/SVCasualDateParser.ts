import { ParsingContext } from "../../../chrono";
import { ParsingComponents, ParsingResult } from "../../../results";
import dayjs from "dayjs";
import { AbstractParserWithWordBoundaryChecking } from "../../../common/parsers/AbstractParserWithWordBoundary";
import { assignSimilarDate, assignTheNextDay, implySimilarTime } from "../../../utils/dayjs";
import SVCasualTimeParser from "./SVCasualTimeParser";
import * as references from "../../../common/casualReferences";

const PATTERN = new RegExp(
    `(nu|idag|imorgon|övermorgon|igår|förrgår|letzte\\s*nacht)` +
        `(?:\\s*(morgon|förmiddag|lunch|eftermiddag|kväll|natt|midnatt))?` +
        `(?=\\W|$)`,
    "i"
);

const DATE_GROUP = 1;
const TIME_GROUP = 2;

export default class DECasualDateParser extends AbstractParserWithWordBoundaryChecking {
    innerPattern(context: ParsingContext): RegExp {
        return PATTERN;
    }

    innerExtract(context: ParsingContext, match: RegExpMatchArray): ParsingComponents | ParsingResult {
        let targetDate = dayjs(context.refDate);
        const dateKeyword = (match[DATE_GROUP] || "").toLowerCase();
        const timeKeyword = (match[TIME_GROUP] || "").toLowerCase();

        let component = context.createParsingComponents();
        switch (dateKeyword) {
            case "nu":
                component = references.now(context.refDate);
                break;

            case "idag":
                component = references.today(context.refDate);
                break;

            case "imorgon":
                assignTheNextDay(component, targetDate);
                break;

            case "övermorgon":
                targetDate = targetDate.add(1, "day");
                assignTheNextDay(component, targetDate);
                break;

            case "igår":
                targetDate = targetDate.add(-1, "day");
                assignSimilarDate(component, targetDate);
                implySimilarTime(component, targetDate);
                break;

            case "förrgår":
                targetDate = targetDate.add(-2, "day");
                assignSimilarDate(component, targetDate);
                implySimilarTime(component, targetDate);
                break;

            default:
                if (dateKeyword.match(/letzte\s*nacht/)) {
                    if (targetDate.hour() > 6) {
                        targetDate = targetDate.add(-1, "day");
                    }

                    assignSimilarDate(component, targetDate);
                    component.imply("hour", 0);
                }

                break;
        }

        if (timeKeyword) {
            component = SVCasualTimeParser.extractTimeComponents(component, timeKeyword);
        }

        return component;
    }
}
