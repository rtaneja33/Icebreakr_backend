import { Gender } from "./user";
import { IPhone } from "./common";

export enum LookingForOptions {
	NEW_FRIENDS = "new friends",
    MARRIAGE = "marriage",
    SERIOUS_RELATIONSHIP = "serious relationship",
    SHORT_TERM_RELATIONSHIP = "short term relationship",
    HOOK_UP = "hook up",
    OPEN_TO_ALL = "Open to all"
}
export enum Options {
	YES = "yes",
	NO = "no",
	DOESNOTMATTER = "nomatter"
}

export enum Ethnicity {
    ASIAN = "Asian",
    WHITE = "White",
    BLACK = "Black",
    LATIN = "Hispanic/Latin",
    OTHER = "Other",
    OPEN_TO_ALL = "Open to all"
}

export enum Education {
    HIGH_SCHOOL = "High School",
    UNDER_GRADUATE = "Under Graduate",
    GRADUATE = "Graduate",
    POST_GRADUATE = "Post - Graduate",
    OPEN_TO_ALL = "Open to all"
}

export enum LookingFor {
	MEN = "men",
    WOMEN = "women",
    BOTH = "both"
}

export enum SunSign {
	CAPRICORN = "capricorn",
	AQUARIUS = "aquarius",
	PISCES = "pisces",
	ARIES = "aries",
	TAURUS = "taurus",
	GEMINI = "gemini",
	CANCER = "cancer",
	LEO = "leo",
	VIRGO = "virgo",
	LIBRA = "libra",
	SCORPIO = "scorpio",
    SAGITTARIUS = "sagittarius",
    OPEN_TO_ALL = "Open to all"
}

export interface IUserPreferences {
    lookingFor: [String],
    ethnicity: [String],
    education: [String],
    sunSign: [String],
    kids: {
        type: String,
        enum: [Options.YES, Options.NO, Options.DOESNOTMATTER]
    },
    pets: {
        type: String,
        enum: [Options.YES, Options.NO, Options.DOESNOTMATTER]
    },
    smoking: {
        type: String,
        enum: [Options.YES, Options.NO, Options.DOESNOTMATTER]
    },
    drinking: {
        type: String,
        enum: [Options.YES, Options.NO, Options.DOESNOTMATTER]
    },
    activities : [String]
}
export interface IUserAdditionalInfo {
    interestedIn: {
        type: String,
        enum: [LookingFor.MEN, LookingFor.WOMEN, LookingFor.BOTH]
    },
    kids: {
        type: String,
        enum: [Options.YES, Options.NO, Options.DOESNOTMATTER]
    },
    pets: {
        type: String,
        enum: [Options.YES, Options.NO, Options.DOESNOTMATTER]
    },
    smoking: {
        type: String,
        enum: [Options.YES, Options.NO, Options.DOESNOTMATTER]
    },
    drinking: {
        type: String,
        enum: [Options.YES, Options.NO, Options.DOESNOTMATTER]
    },
    education: {
        type: String,
        enum: [Education.GRADUATE, Education.HIGH_SCHOOL, Education.POST_GRADUATE,
                Education.UNDER_GRADUATE]
    },
    ethnicity: {
        type: String,
        enum: [Ethnicity.ASIAN, Ethnicity.BLACK, Ethnicity.LATIN,
                Ethnicity.OTHER, Ethnicity.WHITE]
    },
    gender: {
        type: String,
        enum: [Gender.Female, Gender.Male]
      }
    phoneNumber: IPhone,
    country: String,
    lookingForAge: [number, number],
    lookingForDistance: number,
    lookingFor: {
        type: [String],
        enum: [LookingForOptions.HOOK_UP, LookingForOptions.MARRIAGE,
                LookingForOptions.NEW_FRIENDS, LookingForOptions.OPEN_TO_ALL,
                LookingForOptions.SERIOUS_RELATIONSHIP, LookingForOptions.SHORT_TERM_RELATIONSHIP]
    },
    sunSign: {
        type: String,
        enum: [SunSign.AQUARIUS, SunSign.ARIES, SunSign.CANCER, SunSign.CAPRICORN,
                SunSign.GEMINI, SunSign.LEO, SunSign.LIBRA, SunSign.PISCES, SunSign.PISCES,
                SunSign.SAGITTARIUS, SunSign.SCORPIO, SunSign.TAURUS, SunSign.VIRGO]
    },
    publicProfile: Boolean,
    pushNotification: Boolean,
    preferences: IUserPreferences
}