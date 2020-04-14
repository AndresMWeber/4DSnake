<p align="center">
    <a href="https://andresmweber.github.io/4DSnake/" rel="noopener">
        <img width=300px height=300px src="https://raw.githubusercontent.com/andresmweber/4dsnake/master/presentation/promotional/promo.png " alt="4DSnake Promo">
    </a>
</p>

<h2 align="center">"4D" Snake 🐍</h2>

<h5 align="center">To Play 4D Snake:</h5>

<h5 align="center">
    <img width=14px alt="Github Favicon" src="https://github.githubassets.com/favicon.ico" />
    <a href="https://andresmweber.github.io/4DSnake/">CLICK HERE</a>
</h5>

<h5 align="center">
    <img width=14px alt="Heroku Favicon" src="https://www.herokucdn.com/favicons/favicon.ico" />
    <a href="https://fourdsnake.herokuapp.com/">OR HERE</a>
</h5>

<div align="center">
    <a href="https://github.com/AndresMWeber/4DSnake">
        <img alt="Status" src="https://img.shields.io/badge/status-active-success.svg" />
    </a>
    <a href="https://github.com/AndresMWeber/4DSnake/issues">
        <img alt="Issues" src="https://img.shields.io/github/issues/andresmweber/4DSnake.svg" />
    </a>
    <a href="https://github.com/AndresMWeber/4DSnake/blob/master/LICENSE">
        <img alt="License" src="https://img.shields.io/badge/License-BSD%203--Clause-blue.svg" />
    </a>
</div>
<div align="center">
    <a href="https://www.npmjs.com/package/4dsnake">
        <img alt="NPM" src="https://nodei.co/npm/4dsnake.png?compact=true" />
    </a>
</div>
---

<p align="center"> You've all seen snake, but let's bring it into the true third (not really fourth) D I M E N S I O N!
    <br> 
</p>

## 📝 Table of Contents

- [About](#about)
- [How To Play](#howto)
- [Installing](#installing)
- [Deployment](#deployment)
- [Built Using](#built_using)
- [Authors](#authors)
- [Acknowledgments](#acknowledgement)

## 🧐 About <a name = "about"></a>

After seeing Snake game after Snake game, I noticed that the trend was whenever it was adapted to 3D it always lacked Y-axis movement! Since I felt that was a total waste of a dimension that set me off to implement a version of it that wasn't constrained to two axes in JavaScript. After finding [three.js](https://threejs.org/) I knew I would be able to complete my idea! Without futher ado:

## 🕹️ How to Play <a name = "howto"></a>

<div align="center">
    <table>
        <tr width=400px>
        <td>
            <img width=400px src="https://github.com/AndresMWeber/4DSnake/blob/master/presentation/demo.gif?raw=true" alt="4D Snake!" />
        </td>
        <td valign="top">
          <table width=400px>
                <tr>
                    <td align="center" colspan="3"><h3>Control Scheme</h3></td>
                </tr>
                <tr>
                    <td></td>
                    <td><b>PC</b></td>
                    <td><b>Mobile</b></td>
                </tr>
                <tr>
                    <td><b>Left</b></td>
                    <td>A</td>
                    <td>Swipe Left</td>
                </tr>
                <tr>
                    <td><b>Right</b></td>
                    <td>D</td>
                    <td>Swipe Right</td>
                </tr>
                <tr>
                    <td><b>Up</b></td>
                    <td>W</td>
                    <td>Swipe Up</td>
                </tr>
                <tr>
                    <td><b>Down</b></td>
                    <td>S</td>
                    <td>Swipe Down</td>
                </tr>
                <tr>
                    <td><b>Rotate Camera</b></td>
                    <td>Left Click</td>
                    <td>Drag Triple Touch</td>
                </tr>
                <tr>
                    <td><b>Zoom Camera</b></td>
                    <td>Mouse Wheel</td>
                    <td>Drag Double Touch</td>
                </tr>
            </table>
        </td>
        </tr>
    </table>
</div>

### Installing

You can test and run this just by dragging `public/index.html` into the browser.

Feel free to install using NPM as well `npm install 4dsnake`.

## 🚀 Deployment <a name = "deployment"></a>

This project is deployed on **Github Pages**. By keeping the top level `index.html` file, it will automatically populate to github pages. The only thing you need to do is edit the route to your own `public/index.html` route hosted on github pages.

You can also host this project on any cloud deployment you like, I chose **Heroku** for its quick setup. It hosts the project using **NodeJS** a simple _http-server_ that uses the `$PORT` environment variable (or defaults to `4000`).

## ⛏️ Built Using <a name = "built_using"></a>

- [NodeJS](https://www.nodejs.org/) - Web Server
- [JavaScript](https://www.javascript.com/) - Front End
- [ThreeJS](https://threejs.org/) - 3D Engine
- [CSS](https://www.w3.org/Style/CSS//) - Styling
- [Maya](https://www.autodesk.com/products/maya/overview) - 3D Content

## ✍️ Authors <a name = "authors"></a>

- [@andresmweber](https://github.com/andresmweber) - Idea & Completed work

## 🎉 Acknowledgements <a name = "acknowledgement"></a>

- [@Ironhack](https://github.com/ironhack) for supporting me during the project!
- [@bobbypwang](https://github.com/bobbypwang) - For keeping me sane throughout the project and helping me brainstorm the idea.
- [@crispinonicky](https://github.com/crispinonicky) - For helping me out with some radian math!
