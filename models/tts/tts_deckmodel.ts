export class ttsDeck {
    SaveName: string = "";
    Date: string = "";
    VersionNumber: string = "";
    GameMode: string = "";
    GameType: string = "";
    GameComplexity: string = "";
    Tags: string[] = [];
    Gravity: number =  0.5;
    PlayArea: number =  0.5;
    Table: string = "";
    Sky: string = "";
    Note: string = "";
    TabStates: any = {};
    LuaScript: string = "";
    LuaScriptState: string = "";
    XmlUI: string = "";
    ObjectStates: (ttsDeckCustom | ttsCard)[] = [];
}

export class ttsDeckCustom {
    GUID: string = "empty";
    Name: string = "DeckCustom"
    Transform: ttsTransform = {
        posX: -0.279157281,
        posY: 1.2649585,
        posZ: -5.04879475,
        rotX: -6.57048031E-06,
        rotY: 180.0,
        rotZ: 180.0,
        scaleX: 1.0,
        scaleY: 1.0,
        scaleZ: 1.0
    };
    Nickname: string = "Deck";
    Description: string = "";
    GMNotes: string = "" ;
    AltLookAngle: any = {
        x: 0.0,
        y: 0.0,
        z: 0.0
    };
    ColorDiffuse: any = {
        r: 0.713235259,
        g: 0.713235259,
        b: 0.713235259
    };
    LayoutGroupSortIndex: number = 0;
    Value: number = 0;
    Locked: boolean = false;
    Grid:  boolean = true;
    Snap:  boolean = true;
    IgnoreFoW:  boolean = false;
    MeasureMovement:  boolean = false;
    DragSelectable:  boolean = true;
    Autoraise:  boolean = true;
    Sticky:  boolean = true;
    Tooltip:  boolean = true;
    GridProjection:  boolean = false;
    HideWhenFaceDown:  boolean = false;
    Hands:  boolean = false;
    SidewaysCard:  boolean = false;
    DeckIDs: number[] = [];
    CustomDeck: Record<string, ttsCustomDeck> = {};
    ContainedObjects: ttsCard[] = [];
}

export class ttsCard { 
    GUID: string = "";
    Name: string = "Card"
    Transform: ttsTransform = {
        posX: -0.279157281,
        posY: 1.2649585,
        posZ: -5.04879475,
        rotX: -6.57048031E-06,
        rotY: 180.0,
        rotZ: 180.0,
        scaleX: 1.0,
        scaleY: 1.0,
        scaleZ: 1.0
    };
    Nickname: string = "card name and types";
    Description: string = "card description body";
    GMNotes: string = "" ;
    AltLookAngle: any = {
        x: 0.0,
        y: 0.0,
        z: 0.0
    };
    ColorDiffuse: any = {
        r: 0.713235259,
        g: 0.713235259,
        b: 0.713235259
    };
    LayoutGroupSortIndex: number = 0;
    Value: number = 0;
    Locked: boolean = false;
    Grid:  boolean = true;
    Snap:  boolean = true;
    IgnoreFoW:  boolean = false;
    MeasureMovement:  boolean = false;
    DragSelectable:  boolean = true;
    Autoraise:  boolean = true;
    Sticky:  boolean = true;
    Tooltip:  boolean = true;
    GridProjection:  boolean = false;
    HideWhenFaceDown:  boolean = true;
    Hands:  boolean = true;
    CardID: number = 100;
    SidewaysCard:  boolean = false;
    CustomDeck: Record<string, ttsCustomDeck> = {};
    LuaScript: string = "";
    LuaScriptState: string = "";
    XmlUI: string = "";
    States: Record<string, ttsCard> = {}
}

export class ttsTransform {
    posX: number = -0.279157281;
    posY: number = 1.2649585;
    posZ: number = -5.04879475;
    rotX: number = -6.57048031E-06;
    rotY: number = 180.0;
    rotZ: number = 180.0;
    scaleX: number = 1.0;
    scaleY: number = 1.0;
    scaleZ: number = 1.0
}

export class ttsCustomDeck {
    FaceURL: string = "";
    BackURL: string = "";
    NumWidth: number = 1;
    NumHeight: number = 1;
    BackIsHidden: boolean = true;
    UniqueBack: boolean = false;
    Type: number = 0;
}