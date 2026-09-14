/**
 * server.ts (Root Export)
 * 
 * Re-exports the complete Battle WebSocket Server and Room Manager.
 */

export * from './server/server';

if (require.main === module) {
  const { BattleServer } = require('./server/server');
  new BattleServer(Number(process.env.PORT || 4001));
}
