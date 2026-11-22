import{pool}from'./db.js';
// Pick an explicit completed prefix; never skip an unread launch in the interval.
export async function completedPartialEnd(database=pool,now=Date.now()):Promise<string>{
 const end=new Date(now-60000);
 const sessions=await database.query('SELECT clock_timestamp() AS database_now,min(started_at) AS started,max(heartbeat_at) AS heartbeat FROM core.collector_sessions');
 if(!sessions.rows[0]?.started)throw Object.assign(new Error('Refused: no collection coverage'),{code:'NO_COVERAGE'});
 const session=sessions.rows[0];if(!session.heartbeat||new Date(session.database_now??now).getTime()-new Date(session.heartbeat).getTime()>30000)throw Object.assign(new Error('Refused: collector coverage is stale'),{code:'STALE_COLLECTOR'});
 let start=new Date(sessions.rows[0].started);
 const boundary=await database.query("SELECT max(detected_at) AS boundary FROM core.gaps WHERE reason='collector_start_or_restart_unverified_coverage' AND detected_at<=$1",[new Date(now)]);
 if(boundary.rows[0]?.boundary)start=new Date(boundary.rows[0].boundary);
 if(start.getTime()<=now-86400000)throw Object.assign(new Error('Refused: no current partial coverage'),{code:'PARTIAL_NOT_ALLOWED'});
 if(start>=end)throw Object.assign(new Error('Refused: waiting for finalized coverage'),{code:'NO_COMPLETED_WINDOW'});
 const pending=await database.query("SELECT min(block_time) AS pending FROM core.launches WHERE block_time>=$1 AND block_time<$2 AND metadata_status<>'ok'",[start,end]);
 const completeEnd=pending.rows[0]?.pending?new Date(pending.rows[0].pending):end;
 const count=await database.query('SELECT count(*)::int AS launches FROM core.launches WHERE block_time>=$1 AND block_time<$2',[start,completeEnd]);
 if(completeEnd<=start||!count.rows[0]?.launches)throw Object.assign(new Error('Refused: no completed launches yet'),{code:'NO_COMPLETED_LAUNCHES'});
 return completeEnd.toISOString();
}
