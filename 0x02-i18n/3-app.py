#!/usr/bin/env python3
"""Python file"""


from flask import Flask, render_template, request, Response
from flask_babel import Babel, _
from typing import Optional


class Config:
    """Language Config class"""

    LANGUAGES = ["en", "fr"]
    BABEL_DEFAULT_LOCALE = "en"
    BABEL_DEFAULT_TIMEZONE = "UTC"


app = Flask(__name__)
app.config.from_object(Config)

babel = Babel(app)


@babel.localeselector
def get_locale() -> Optional[str]:
    """Determines the users prefered language"""
    return request.accept_languages.best_match(app.config["LANGUAGES"])


@app.route("/")
def home() -> Response:
    """rETURNS A SIMPLE PAGE"""
    return render_template("index.html")


if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True, port=7000)
