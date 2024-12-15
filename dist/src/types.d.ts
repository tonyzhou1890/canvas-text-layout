export interface UserConfig {
    ctx?: CanvasRenderingContext2D;
    width?: number;
    height?: number;
    text?: string;
    hyphen?: string;
    textAlign?: 'left' | 'center' | 'right' | 'justify';
    fontSize?: number;
    lineHeight?: number;
}
export interface MeasureCharsParams {
    text: string;
    ctx: CanvasRenderingContext2D;
    hyphen?: string;
}
export interface MeasureCharsReturns {
    measures: {
        [x: string]: number;
    };
    textArray: string[];
}
export interface TextToPageParams extends MeasureCharsReturns {
    textOffsetIndex: number;
    width?: number;
    height?: number;
    fontSize: number;
    lineHeight: number;
    hyphen: string;
}
export type TextToPageReturns = Array<{
    page: number;
    startIndex: number;
    endIndex: number;
    rows: PageRow[];
}>;
export interface PageRow {
    startIndex: number;
    endIndex: number;
    completed: boolean;
    empty: boolean;
    chars: string[];
    appendix?: string;
}
export interface PageLayoutParams {
    rows: PageRow[];
    width?: number;
    fontSize: number;
    lineHeight: number;
    textAlign?: 'left' | 'center' | 'right' | 'justify';
    measures: MeasureCharsReturns['measures'];
}
export type RectPosition = {
    x: number;
    y: number;
    width: number;
    height: number;
};
export type LayoutReturns = Array<{
    startIndex: number;
    endIndex: number;
    completed: boolean;
    calculated: boolean;
    letterSpacing: number;
    chars: {
        char: string;
        position: RectPosition;
    }[];
    charsRect: RectPosition;
    rowRect: RectPosition;
}>;
