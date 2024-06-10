import Joi from 'joi';

const reportIssueInputSchema = Joi.object({
  orderNumber: Joi.string().required(),
  issueType: Joi.string().required(),
  description: Joi.string().required(),
});

const fileUploadSchema = Joi.object({
  filename: Joi.string().required(),
  mimetype: Joi.string().valid('image/jpeg', 'image/png', 'image/gif').required(), 
  encoding: Joi.string().valid('base64', 'binary').required(), 
  size: Joi.number().max(10 * 1024 * 1024).required(), 
});

interface ReportIssueInput {
    orderNumber: string;
    issueType: string;
    description: string;
  }
  
const validateReportIssueInput = (input:ReportIssueInput) => {
  return reportIssueInputSchema.validate(input);
};

const validateFileUpload = (file: any) => {
  return fileUploadSchema.validate(file);
};

export {
  validateReportIssueInput,
  validateFileUpload,
};
