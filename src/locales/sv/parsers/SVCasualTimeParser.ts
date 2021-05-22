import { ParsingContext } from "../../../chrono";
import { ParsingComponents, ParsingResult } from "../../../results";
import dayjs from "dayjs";
import { Meridiem } from "../../../index";
import { AbstractParserWithWordBoundaryChecking } from "../../../common/parsers/AbstractParserWithWordBoundary";
import { implySimilarTime } from "../../../utils/dayjs";
import { addImpliedTimeUnits } from "../../../utils/timeunits";

export default class DECasualTimeParser extends AbstractParserWithWordBoundaryChecking {
    innerPattern(context: ParsingContext): RegExp {
        return /(diesen)?\s*(morgon|förmiddag|lunch|lunchtid|middag?|eftermiddag|kväll|natt|midnatt|sen\skväll)(?=\W|$)/i;
    }

    innerExtract(context: ParsingContext, match: RegExpMatchArray): ParsingComponents | ParsingResult {
        const targetDate = dayjs(context.refDate);
        const timeKeywordPattern = match[2].toLowerCase();
        const component = context.createParsingComponents();
        implySimilarTime(component, targetDate);
        return DECasualTimeParser.extractTimeComponents(component, timeKeywordPattern);
    }

    static extractTimeComponents(component: ParsingComponents, timeKeywordPattern: string): ParsingComponents {
        switch (timeKeywordPattern) {
            case "morgen":
                component.imply("hour", 6);
                component.imply("minute", 0);
                component.imply("second", 0);
                component.imply("meridiem", Meridiem.AM);
                break;

            case "förmiddag":
                component.imply("hour", 9);
                component.imply("minute", 0);
                component.imply("second", 0);
                component.imply("meridiem", Meridiem.AM);
                break;

            case "middag":
            case "lunch":
            case "lunchtid":
                component.imply("hour", 12);
                component.imply("minute", 0);
                component.imply("second", 0);
                component.imply("meridiem", Meridiem.AM);
                break;

            case "eftermiddag":
                component.imply("hour", 15);
                component.imply("minute", 0);
                component.imply("second", 0);
                component.imply("meridiem", Meridiem.PM);
                break;

            case "kväll":
            case "kvällstid":
                component.imply("hour", 18);
                component.imply("minute", 0);
                component.imply("second", 0);
                component.imply("meridiem", Meridiem.PM);
                break;

            case "sen kväll":
                component.imply("hour", 22);
                component.imply("minute", 0);
                component.imply("second", 0);
                component.imply("meridiem", Meridiem.PM);
                break;

            case "midnatt":
                if (component.get("hour") > 1) {
                    component = addImpliedTimeUnits(component, { "day": 1 });
                }

                component.imply("hour", 0);
                component.imply("minute", 0);
                component.imply("second", 0);
                component.imply("meridiem", Meridiem.AM);
                break;
        }
        return component;
    }
}
