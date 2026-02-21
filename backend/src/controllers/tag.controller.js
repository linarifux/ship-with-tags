import * as shipstationService from '../services/shipstation.service.js';

/**
 * @desc    Fetch all tags from ShipStation
 * @route   GET /api/tags
 * @access  Public
 */
export const getAllTags = async (req, res, next) => {
  try {
    const tags = await shipstationService.getTags();
    res.json(tags);
  } catch (error) {
    // Passes the error to your global Express error handler
    res.status(500);
    next(error);
  }
};

/**
 * @desc    Create a new global tag in ShipStation
 * @route   POST /api/tags
 * @access  Public
 */
export const createNewTag = async (req, res, next) => {
  try {
    const { name, color } = req.body;
    
    // Validate the input and prevent empty space tags
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Tag name is required" });
    }

    // Call the service with the sanitized data
    const newTag = await shipstationService.createTag({ 
      name: name.trim(), 
      color 
    });
    
    res.status(201).json(newTag);
  } catch (error) {
    res.status(500);
    next(error);
  }
};