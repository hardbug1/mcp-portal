/**
 * MCP Portal - MCP 서버 생성 플랫폼
 * 진입점 파일
 */

console.log('🚀 MCP Portal 시작!');

export default function main(): void {
  console.log('MCP 서버 생성 플랫폼이 시작되었습니다.');
}

// ES Module에서는 import.meta.url을 사용하여 직접 실행 확인
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
} 