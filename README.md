# Password and Word Generator

## Description

This project is a React-based application that provides two main functionalities: a Password Generator and a Word Generator. The Password Generator creates secure and customizable passwords based on user-defined criteria, while the Word Generator generates random words from a predefined list. Both components are designed with a user-friendly interface using Tailwind CSS for styling.

## Features

- **Password Generator**:

  - Customizable password length (8 to 32 characters).
  - Options to include uppercase letters, lowercase letters, numbers, and symbols.
  - Generates strong, secure passwords that meet common security standards.
  - Copy generated passwords to clipboard with a single click.

- **Word Generator**:
  - Generate a specified number of random words.
  - Words can be copied to clipboard in a hyphen-separated format.
  - User-friendly slider to adjust the number of words generated.

## Technologies Used

- React
- Tailwind CSS
- React Icons
- Chrome Storage API (for saving user settings)

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Bhavik-Jikadara/pw-generator.git
   cd pw-generator
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

3. Build the project

   ```bash
   npm run build
   ```

4. Load the extension in Chrome
   To run the extension locally in Chrome, follow these steps:

   1. Open Chrome and go to the Extensions page by navigating to `chrome://extensions/` or by clicking the three-dot menu in the top-right corner, selecting **More Tools**, and then **Extensions**.
   2. Enable **Developer Mode** in the top-right corner of the Extensions page.
   3. Click the Load unpacked button.
   4. In the file dialog that opens, navigate to the `build/` folder in your project directory (the one generated after running `npm run build`).
   5. Select the `build/` folder and click **Select Folder** (or Open, depending on your OS).

## Usage

- **Password Generator**:

  - Adjust the password length using the slider.
  - Toggle the options to include uppercase letters, lowercase letters, numbers, and symbols.
  - Click the "Generate Password" button to create a new password.
  - Click "Copy to Clipboard" to copy the generated password.

- **Word Generator**:
  - Use the slider to select the number of words to generate.
  - Click the "Generate Words" button to create random words.
  - Click "Copy to Clipboard" to copy the generated words in a hyphen-separated format.

## Contributing

Contributions are welcome! If you have suggestions for improvements or new features, please open an issue or submit a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Thanks to the contributors and the open-source community for their support and resources.
