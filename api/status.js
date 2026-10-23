import { aiStatus } from '../server/ai.js';

export default function status(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json(aiStatus());
}
