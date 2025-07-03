describe('MCP Portal 기본 테스트', () => {
  it('should pass basic test', () => {
    expect(2 + 2).toBe(4);
  });

  it('should have correct environment', () => {
    expect(process.env.NODE_ENV).toBe('test');
  });
}); 