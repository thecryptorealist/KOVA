import {defineRailway,project,service,preserve} from 'railway/iac';

// Secrets live in Railway shared variables; this source contains references only.
export default defineRailway(ctx => {
  const shared = {NODE_ENV: 'production', DATABASE_URL: preserve()};
  const web = service('kova-web', {
    build: 'npm run build', start: 'npm start', healthcheck: '/healthz',
    healthcheckTimeout: 60, replicas: 1, env: shared,
  });
  const collector = service('kova-collector', {
    build: 'npm run build', start: 'npm run start:collector', replicas: 1,
    env: {...shared, SOLANA_RPC_HTTP: preserve(), SOLANA_RPC_WS: preserve()},
  });
  const metadata = service('kova-metadata', {
    build: 'npm run build', start: 'npm run start:metadata', replicas: 1, env: shared,
  });
  const indexer = service('kova-indexer', {
    build: 'npm run build', start: 'npm run start:indexer', replicas: 1, env: shared,
  });
  return project('Kova', {resources: [web, collector, metadata, indexer]});
});
