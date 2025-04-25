import KSUID from 'ksuid';

export async function generateTimeCapsuleId() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const ksuid = await KSUID.random();
  return `${date}-${ksuid.string}`;
}