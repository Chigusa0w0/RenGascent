export module NgaData {

    export enum PostAttribute
    {
        None = 0,
        Hide = 2, // 隐藏
        Scheduled = 8, // 延时
        Report = 32, // 举报标记
        Edit = 128, // 编辑
        Occupy = 256, // 占楼
        Auditing = 512, // 正等待审核 (红审)
        Lock = 1024, // 锁定
        Violation = 2048, // 处罚标记
        Attachment = 8192, // 存在附件
        Sanitize = 16384, // 版主审核 (绿审)
        Local = 131072, // 本区
        Anonymous = 262144, // 匿名回复
        Silent = 16777216, // 下沉
        Censored = 67108864, // 审核未通过 (黑审)
    }

    export enum TitleAttribute
    {
        None = 0,

        Red = 1 << 0,
        Blue = 1 << 1,
        Green = 1 << 2,
        Orange = 1 << 3,
        Silver = 1 << 4,
        Colors = Red | Blue | Green | Orange | Silver,

        Bold = 1 << 5,
        Italic = 1 << 6,
        Strike = 1 << 7,
        Fonts = Bold | Italic | Strike,
    }

    export enum ActivateLevel
    {
        ActivatedWechat = 5,
        ActivatedPhone = 4,
        ActivatedAssoc = 3,
        ActivatedCode = 1,
        Unactivated = 0,
        Nuked = -1,
        LockedManual = -2,
        LockedReset = -3,
        LockedChange = -4,
        LockedPermanent = -5
    }

    export enum AuthLevel
    {
        EmployeeAdmin = 86, // 阵营领袖工作人员
        EmployeeManager = 83, // 稀有精英工作人员
        EmployeeLeader = 82, // 精英工作人员
        Employee = 81, // 网站工作人员
        Titan = 3,
        Overseer = 90,
        Scythe = 4,
        Arbiter = 77,
        Warden = 5,
        Guard = 74,
        Ranger = 72,
        OldGod = 66,
        Normal = -1,
    }

    export enum DisplayLevel
    {
        EmployeeAdmin = 86, // 阵营领袖工作人员
        EmployeeManager = 83, // 稀有精英工作人员
        EmployeeLeader = 82, // 精英工作人员
        Employee = 81, // 网站工作人员
        Titan = 3,
        Overseer = 90,
        Scythe = 4,
        Arbiter = 77,
        Warden = 5,
        Guard = 74,
        Ranger = 72,
        OldGod = 66,
        Normal = -1,

        Chosen = 54, // 天选之人 贵宾
        Clergy = 60, // 教主 > 90
        Virtuoso = 70, // 宗师 40 - 89
        Maestro = 41, // 大师 20 - 39
        Expert = 69, // 专家 15 - 19
        Craftsman = 40, // 工匠 10 - 14
        Assistant = 76, // 助手 5 - 9
        Novice = 73, // 学徒 2 - 4
        Newbie = 39, // 平民 0 - 1
        Warn1 = 42, // 警告等级1 -4 - 0
        Warn2 = 43, // 警告等级2 -9 - -5
        Warn3 = 44, // 警告等级3 -14 - -10
        Warn4 = 45, // 警告等级4 < -15
    }

    export interface IThread {
        tid: number;
        fid: number;
        uid: number;
        title: string;
        time: number;
        lastPostTime: number;
        lastModTime: number;
        lastPostUname: string;
        postcnt: number;
        attribute: PostAttribute;
        titleAttr: TitleAttribute;
        weight: number;
        stid: number;
        recordTime: number;
    }

    export interface IPost {
        pid: number;
        fid: number;
        tid: number;
        uid: number;
        floor: number;
        weight: number;
        content: string;
        upvote: number;
        downvote: number;
        time: number;
        length: number;
        client: string;
        title: string;
        alterinfo: string;
        attribute: PostAttribute;
        commentTo: number | null;
        recordTime: number;
    }

    export interface IUser {
        uid: number;
        uname: string;
        time: number;
        postcnt: number;
        credit: number;
        lastSeenTime: number;
        globalMuteTime: number;
        gold: number;
        signature: string;
        fieldName: string;
        activeLevel: ActivateLevel;
        authLevel: AuthLevel;
        displayLevel: DisplayLevel;
        recordTime: number;

        _avatarUrl: string;
    }

    export interface IContentData {
        thread: IThread | null;
        post: IPost | null;
        user: IUser | null;
    }
}