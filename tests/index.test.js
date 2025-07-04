"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("../src/index"));
describe('MCP Portal 기본 테스트', () => {
    test('main 함수가 정상적으로 실행되는지 확인', () => {
        // console.log를 모킹하여 테스트
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        (0, index_1.default)();
        expect(consoleSpy).toHaveBeenCalledWith('MCP 서버 생성 플랫폼이 시작되었습니다.');
        consoleSpy.mockRestore();
    });
    test('기본 산술 연산 테스트', () => {
        expect(2 + 2).toBe(4);
    });
});
