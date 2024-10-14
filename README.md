# purge-react-icons

> Purge unused icons from react-icons during development to solve memory issues

## Usage

```sh
# Default directorz is src
npx purge-react-icons

# Passing source directory
npx purge-react-icons lib
```

Over the years I had many issues using `react-icons` in my projects during development.
Recently I had to use a laptop having 8GB RAM only for a large Next.js project, and I wasn't able to run the project because of the memory usage caused by `react-icons`.
To solve this issue, I created this package to remove unused icons from `react-icons` and reduce memory usage.

## How it works

This package will scan the source directory for all the files and find all the icons used in the project.
Then it will remove all the unused icons from `react-icons` and create a new `react-icons` package with only the used icons.
The original `react-icons` package will be backed up in a `react-icons_backup` directory,
so every time you run the command it'll work from the backed up `react-icons` package.

You need to run this command every time you add new icons to your project. This is a minor inconvenience for mature projects,
for new projects it might be annoying to run this command every time you add new icons, but it's a viable tradeoff for those having
memory issues with `react-icons`.

TS types are untouched, so autocompletion will work as expected.

Next.js is optimizing barrel files, so you might need to remove the `.next` folder as well to clear caches.

Even if you have a large amount memory, you might want to use this package to reduce the overall memory usage of your project and to achieve faster startup times.

This tool is only intended for development purposes, you should not use it in production. In production tree shaking should be handled by your bundler, so there is no need to use this package in production.

## License

MIT © wintercounter
