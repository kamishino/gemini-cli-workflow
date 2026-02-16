# {{PLUGIN_NAME}}

{{PLUGIN_DESCRIPTION}}

## Installation

```bash
kamiflow plugin install {{PLUGIN_NAME}}
```

## Usage

```bash
# Enable the plugin
kamiflow plugin enable {{PLUGIN_NAME}}

# Configure the plugin
kamiflow config set plugins.{{PLUGIN_NAME}}.option value

# Disable the plugin
kamiflow plugin disable {{PLUGIN_NAME}}
```

## Features

- Feature 1
- Feature 2
- Feature 3

## Configuration

The plugin supports the following configuration options:

```json
{
  "plugins": {
    "{{PLUGIN_NAME}}": {
      "option1": "value1",
      "option2": "value2"
    }
  }
}
```

### Options

- `option1` - Description of option 1
- `option2` - Description of option 2

## Commands

This plugin adds the following commands:

- `/kamiflow:{{PLUGIN_NAME}}:command1` - Description
- `/kamiflow:{{PLUGIN_NAME}}:command2` - Description

## Hooks

This plugin listens to the following lifecycle hooks:

- `before:transpile` - Triggered before blueprint transpilation
- `after:build` - Triggered after build completion

## Development

```bash
# Clone the repository
git clone {{REPOSITORY_URL}}

# Install dependencies
npm install

# Link for local development
kamiflow plugin install --source local ./path/to/plugin

# Run tests
npm test
```

## License

{{LICENSE}}

## Author

{{AUTHOR_NAME}}
