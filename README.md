# Memory Map

Turn your life memories into a beautiful visual journey. **Memory Map** lets you organize your memories on an interactive map with photos, dates, and descriptions — then transform them into a beautifully formatted, storybook-style PDF that you can print and keep.

## Screenshots

![Landing Page](./assets/landing-page-02.png)

![Landing Page](./assets/landing-page-01.png)

## Getting Started

The only thing you will need is [Python](https://www.python.org), ensure it's installed by running the following command:

```
$ python --version
Python 3.12.11
```

If you didn't see the version then you need to install it from this [link](https://www.python.org/downloads/).

### 1. Run the Application

From the project's root directory, run:

```sh
python -m http.server
```

### 2. Open in Your Browser

Visit [http://localhost:8000](http://localhost:8000).

## Adding Your Memories

Your memories are stored in a JSON file in the root directory called: `memories.json`. Add your entries in the file using the following structure:

```json
[
  {
    "date": "2020-10-30",
    "image": "./path/to/image.png",
    "description": "Add your memory description here."
  }
]
```

- **date**: The date of the memory (`YYYY-MM-DD`).
- **image**: Path to an image representing the memory (optional).
- **description**: A short description of the memory.

> [!TIP]
> Use images with a **4:3 aspect ratio** for the best visual experience.

## Features

- A clean, simple interface focused on your memories.
- Complete Arabic language support.
- Print your memories as a beautifully formatted, storybook-style PDF.
- No packages to install or build steps required.
