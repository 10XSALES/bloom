// Public demo: all wallet data is stored on the visitor's device.
// Keep this explicit response so older clients cannot access the legacy database.
export function GET(){return Response.json({error:'Online wallet storage is disabled. Use a local backup.'},{status:410,headers:{'Cache-Control':'no-store'}})}
export function PUT(){return GET()}
