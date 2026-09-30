const DECK_OWNER_KEY = "showdeckowner";

export const getShowDeckOwner = () => localStorage.getItem(DECK_OWNER_KEY) === "true";
export const setShowDeckOwner = (show: boolean) => localStorage.setItem(DECK_OWNER_KEY, String(show));
