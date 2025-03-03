const missingRequiredParameters = {
    title: "Missing required parameters",
    description: "No room or username defined.",
    action: "Back to Home",
    href: "/",
}

type CommonErrors = {
    [key: string]: {
        title: string
        description: string
        action: string
        href: string
    }
}

const COMMON_ERRORS: CommonErrors = {
    "missing-required-parameters": missingRequiredParameters,
}

export const getError = (errorCode: string) => {
    return COMMON_ERRORS[errorCode] || {
        title: "Unknown error",
        description: "An unknown error occurred.",
        action: "Back to Home",
        href: "/",
    }
}