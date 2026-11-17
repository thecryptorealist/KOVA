import type pg from'pg';
// A stale failed fetch must never undo another worker's committed success.
export function recordMetadataFailure(database:Pick<pg.Pool,'query'>,mint:string,attempts:number,status:'pending'|'failed',nextAttempt:Date){return database.query("UPDATE core.launches SET metadata_attempts=$2,metadata_status=$3,next_metadata_attempt=$4 WHERE mint=$1 AND metadata_status<>'ok'",[mint,attempts,status,nextAttempt]);}
