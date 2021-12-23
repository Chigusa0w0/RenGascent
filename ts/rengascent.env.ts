export module Environment {

    export interface SiteStyle {
        themeColor: string;
    }

    export function getSiteTheme(): SiteStyle {
        let clrs = "#fffcee";

        if (envVariables["__COLOR"]) {
            clrs = envVariables["__COLOR"].bg0;
        }

        return {
            themeColor: clrs
        };
    }

    export var envVariables: any = {};
}