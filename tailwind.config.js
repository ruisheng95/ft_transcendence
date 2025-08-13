/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./*.{html,js,ts,jsx,tsx}",     // root-level files
        "./**/*.{html,js,ts,jsx,tsx}", // any depth
    ],
    theme: {
        extend: {
            fontFamily: {
            pixel: ['"Press Start 2P"', 'cursive'],
            inter: ['Inter', 'sans-serif'],
        },
        },
    },
    plugins: [],
};