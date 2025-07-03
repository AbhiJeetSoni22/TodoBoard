import ActionLog from '../models/ActionLog.schema.js';

export const getActions = async (req, res) => {
  try {
    const actions = await ActionLog.find()
      .populate('user', 'name')
      .sort({ timestamp: -1 })
      .limit(20);
    res.json(actions);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};