<!--
SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)

SPDX-License-Identifier: Apache-2.0
-->

<!-- Improved compatibility of back to top link: See: https://github.com/othneildrew/Best-README-Template/pull/73 -->

<a id="readme-top"></a>

<!--
*** Thanks for checking out the Best-README-Template. If you have a suggestion
*** that would make this better, please fork the repo and create a pull request
*** or simply open an issue with the tag "enhancement".
*** Don't forget to give the project a star!
*** Thanks again! Now go create something AMAZING! :D
-->

<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![project_license][license-shield]][license-url]

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/InditexTech/weavejs">
    <picture>
      <img src="images/logo.png" alt="Weave.js logo" width="80" height="80">
    </picture>
  </a>

<h3 align="center">Weave.js Frontend UI Showcase</h3>

  <p align="center">
    Build visual collaborative tools like Excalidraw, Miro, Canva, or Figma!
    <br />
    <a href="https://github.com/InditexTech/weavejs-frontend"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/InditexTech/weavejs-frontend">View Demo</a>
    &middot;
    <a href="https://github.com/InditexTech/weavejs-frontend/issues/new?labels=bug&template=bug-report.md">Report Bug</a>
    &middot;
    <a href="https://github.com/InditexTech/weavejs-frontend/issues/new?labels=enhancement&template=feature-request.md">Request Feature</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<!-- <details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
        <li><a href="#related-repositories">Related repositories</a></li>
      </ul>
    </li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details> -->

<!-- ABOUT THE PROJECT -->

## About The Project

[![Weave.js Screen Shot][product-screenshot]](images/screenshot.png)

This repository contain the Weave.js showcase frontend, its a demo application that highlights the features of Weave.js, a collaborative canvas framework. It provides a user interface for:

- 🖼️ Drawing and manipulating visual elements (like shapes, images, and groups)
- 🧑‍🤝‍🧑 Real-time collaboration via shared rooms
- 🧰 Tool usage such as select, transform, move and erase
- 🔄 Undo/redo and action history

This frontend serves both as:

- A reference implementation for developers building on Weave.js
- A live playground to test and iterate with visual + collaborative features

<!-- <p align="right">(<a href="#readme-top">back to top</a>)</p> -->

### Built With

- [Next.js](https://nextjs.org/)

<!-- <p align="right">(<a href="#readme-top">back to top</a>)</p> -->

### Related repos

- [Weave.js](https://github.com/InditexTech/weavejs)
- Weave.js [showcase backend](https://github.com/InditexTech/weavejs-backend)

<!-- <p align="right">(<a href="#readme-top">back to top</a>)</p> -->

## Quickstart

You can locally launch the frontend showcase by:

- Install dependencies with: `npm install`
- Create a `.env` file on the folder `/code`, and setup the necessary configuration:

  ```
  // Azure Web PubSub endpoint name
  NEXT_PUBLIC_API_ENDPOINT_HUB_NAME=weavejs
  // Weave.js backend endpoint (proxied through Next.js)
  NEXT_PUBLIC_API_ENDPOINT=/weavebff/api/v1
  // Real Weave.js backend endpoint
  BACKEND_ENDPOINT=http://127.0.0.1:8081
  ```

- Run the frontend: `npm run dev`

You'll need access to a [Azure Web PubSub](https://azure.microsoft.com/es-es/products/web-pubsub) instance.

## License

This project is licensed under the terms of the [Apache-2.0](LICENSE) license.

© 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[contributors-shield]: https://img.shields.io/github/contributors/InditexTech/weavejs-frontend.svg?style=for-the-badge
[contributors-url]: https://github.com/InditexTech/weavejs-frontend/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/InditexTech/weavejs-frontend.svg?style=for-the-badge
[forks-url]: https://github.com/InditexTech/weavejs-frontend/network/members
[stars-shield]: https://img.shields.io/github/stars/InditexTech/weavejs-frontend.svg?style=for-the-badge
[stars-url]: https://github.com/InditexTech/weavejs-frontend/stargazers
[issues-shield]: https://img.shields.io/github/issues/InditexTech/weavejs-frontend.svg?style=for-the-badge
[issues-url]: https://github.com/InditexTech/weavejs-frontend/issues
[license-shield]: https://img.shields.io/github/license/InditexTech/weavejs-frontend.svg?style=for-the-badge
[license-url]: https://github.com/InditexTech/weavejs-frontend/blob/master/LICENSE.txt
[product-screenshot]: images/screenshot.png
