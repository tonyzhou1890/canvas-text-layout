import { MeasureCharsParams, MeasureCharsReturns, PageLayoutParams, LayoutReturns, TextToPageParams, TextToPageReturns, UserConfig } from './types';
/**
 * 测量字符
 * @param {MeasureCharsParams} param // 参数对象
 */
export declare function measureChars(param: MeasureCharsParams): {
    textArray: string[];
    measures: {
        [x: string]: number;
    };
};
/**
 * 将文本分配到每一页
 * @param {TextToPageParams} param 参数对象
 */
export declare function textToPage(param: TextToPageParams): TextToPageReturns;
/**
 * 计算页面排版细节
 * @param {PageLayoutParams} param 参数对象
 */
export declare function layout(param: PageLayoutParams): LayoutReturns;
export default class CanvasTextLayout {
    constructor(config?: UserConfig);
    config: UserConfig;
    measuredData?: MeasureCharsReturns;
    textToPageData?: TextToPageReturns;
    layoutPagesData?: LayoutReturns[];
    run(config?: UserConfig): void;
    resize(config?: {
        width?: number;
        height?: number;
        textAlign?: UserConfig['textAlign'];
        lineHeight?: number;
    }): LayoutReturns[] | undefined;
    render(config: {
        offsetX?: number;
        offsetY?: number;
        page: number;
    }): void;
}
