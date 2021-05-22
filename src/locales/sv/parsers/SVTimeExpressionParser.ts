import { AbstractTimeExpressionParser } from "../../../common/parsers/AbstractTimeExpressionParser";
import { ParsingComponents } from "../../../results";
import { ParsingContext } from "../../../chrono";
import { Meridiem } from "../../../index";

export default class SVTimeExpressionParser extends AbstractTimeExpressionParser {
    primaryPrefix(): string {
        return "(?:(?:på|den)\\s*)?";
    }

    followingPhase(): string {
        return "\\s*(?:\\-|\\–|\\~|\\〜|till|tills)\\s*";
    }

    primarySuffix(): string {
        return "(?:\\s*klockan)?(?:\\s*(?:morgon|förmiddag|eftermiddag|kväll|kvällstid|natt|nattetid))?(?=\\W|$)";
    }

    extractPrimaryTimeComponents(context: ParsingContext, match: RegExpMatchArray): ParsingComponents | null {
        const components = super.extractPrimaryTimeComponents(context, match);
        if (components) {
            if (match[0].endsWith("morgon") || match[0].endsWith("förmiddag") || match[0].startsWith("natt")) {
                components.assign("meridiem", Meridiem.AM);
                const hour = components.get("hour");
                if (hour < 12) {
                    components.assign("hour", components.get("hour"));
                }
            }

            if (match[0].startsWith("kväll") || match[0].endsWith("eftermiddag") || match[0].endsWith("nachts")) {
                components.assign("meridiem", Meridiem.PM);
                const hour = components.get("hour");
                if (hour < 12) {
                    components.assign("hour", components.get("hour") + 12);
                }
            }
        }

        return components;
    }
}
