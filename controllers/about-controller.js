export const aboutController = {
  
  // show the about page
  index(request, response) {
    const viewData = {
      title: "WeatherTop",
    };

    response.render("about-view", viewData);
  },
};