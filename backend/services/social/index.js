/**
 * Social Services Index
 * Exports all social platform services for easy importing
 */

const facebook = require('./facebook.service');
const instagram = require('./instagram.service');
const common = require('./common.service');

module.exports = {
  facebook,
  instagram,
  common
}; 