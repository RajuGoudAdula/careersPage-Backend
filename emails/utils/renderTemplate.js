import {baseLayout} from "../layouts/baseLayout.js";

export const renderTemplate = ({ title, template }) => {
  return baseLayout({
    title,
    body: template
  });
};

