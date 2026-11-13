// The github.com repository page around a rendered README, as a signed-out visitor sees it,
// plus a small preview toolbar (Light/Dark, Desktop/Mobile) whose state lives in the URL hash.
import { relativeTime } from './meta.mjs';

export const MD_CSS_CDN = {
  light: 'https://cdn.jsdelivr.net/npm/github-markdown-css@5.8.1/github-markdown-light.min.css',
  dark: 'https://cdn.jsdelivr.net/npm/github-markdown-css@5.8.1/github-markdown-dark.min.css',
};

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Octicons (16px) used by the page chrome.
const P = {
  mark: 'M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z',
  caret: 'm4.427 7.427 3.396 3.396a.25.25 0 0 0 .354 0l3.396-3.396A.25.25 0 0 0 11.396 7H4.604a.25.25 0 0 0-.177.427Z',
  search: 'M10.68 11.74a6 6 0 0 1-7.922-8.982 6 6 0 0 1 8.982 7.922l3.04 3.04a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215ZM11.5 7a4.499 4.499 0 1 0-8.997 0A4.499 4.499 0 0 0 11.5 7Z',
  bars: 'M1 2.75A.75.75 0 0 1 1.75 2h12.5a.75.75 0 0 1 0 1.5H1.75A.75.75 0 0 1 1 2.75Zm0 5A.75.75 0 0 1 1.75 7h12.5a.75.75 0 0 1 0 1.5H1.75A.75.75 0 0 1 1 7.75ZM1.75 12h12.5a.75.75 0 0 1 0 1.5H1.75a.75.75 0 0 1 0-1.5Z',
  sliders: 'M2.75 3.5h6.5v1.5h-6.5ZM11 2.5h1.5v4H11Zm1.5 1h.75v1.5h-.75ZM2.75 11h3.5v1.5h-3.5ZM8 10h1.5v4H8Zm1.5 1h3.75v1.5H9.5Z',
  code: 'm11.28 3.22 4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.749.749 0 0 1-1.275-.326.749.749 0 0 1 .215-.734L13.94 8l-3.72-3.72a.749.749 0 0 1 .326-1.275.749.749 0 0 1 .734.215Zm-6.56 0a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042L2.06 8l3.72 3.72a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L.47 8.53a.75.75 0 0 1 0-1.06Z',
  issue: 'M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z',
  pr: 'M1.5 3.25a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25Zm5.677-.177L9.573.677A.25.25 0 0 1 10 .854V2.5h1A2.5 2.5 0 0 1 13.5 5v5.628a2.251 2.251 0 1 1-1.5 0V5a1 1 0 0 0-1-1h-1v1.646a.25.25 0 0 1-.427.177L7.177 3.427a.25.25 0 0 1 0-.354ZM3.75 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm0 9.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm8.25.75a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0Z',
  play: 'M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Zm4.879-2.773 4.264 2.559a.25.25 0 0 1 0 .428l-4.264 2.559A.25.25 0 0 1 6 10.559V5.442a.25.25 0 0 1 .379-.215Z',
  table: 'M0 1.75C0 .784.784 0 1.75 0h12.5C15.216 0 16 .784 16 1.75v12.5A1.75 1.75 0 0 1 14.25 16H1.75A1.75 1.75 0 0 1 0 14.25ZM6.5 6.5v8h7.75a.25.25 0 0 0 .25-.25V6.5Zm8-1.5V1.75a.25.25 0 0 0-.25-.25H6.5V5Zm-13 1.5v7.75c0 .138.112.25.25.25H5v-8ZM5 5V1.5H1.75a.25.25 0 0 0-.25.25V5Z',
  shield: 'M7.467.133a1.748 1.748 0 0 1 1.066 0l5.25 1.68A1.75 1.75 0 0 1 15 3.48V7c0 1.566-.32 3.182-1.303 4.682-.983 1.498-2.585 2.813-5.032 3.855a1.697 1.697 0 0 1-1.33 0c-2.447-1.042-4.049-2.357-5.032-3.855C1.32 10.182 1 8.566 1 7V3.48a1.755 1.755 0 0 1 1.217-1.667Zm.61 1.429a.25.25 0 0 0-.153 0l-5.25 1.68a.25.25 0 0 0-.174.238V7c0 1.358.275 2.666 1.057 3.86.784 1.194 2.121 2.34 4.366 3.297a.196.196 0 0 0 .154 0c2.245-.956 3.582-2.104 4.366-3.298C13.225 9.666 13.5 8.36 13.5 7V3.48a.251.251 0 0 0-.174-.237l-5.25-1.68ZM8.75 4.75v3a.75.75 0 0 1-1.5 0v-3a.75.75 0 0 1 1.5 0ZM9 10.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z',
  graph: 'M1.5 1.75V13.5h13.75a.75.75 0 0 1 0 1.5H.75a.75.75 0 0 1-.75-.75V1.75a.75.75 0 0 1 1.5 0Zm14.28 2.53-5.25 5.25a.75.75 0 0 1-1.06 0L7 7.06 4.28 9.78a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042l3.25-3.25a.75.75 0 0 1 1.06 0L10 7.94l4.72-4.72a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042Z',
  bell: 'M8 16a2 2 0 0 0 1.985-1.75c.017-.137-.097-.25-.235-.25h-3.5c-.138 0-.252.113-.235.25A2 2 0 0 0 8 16ZM3 5a5 5 0 0 1 10 0v2.947c0 .05.015.098.042.139l1.703 2.555A1.519 1.519 0 0 1 13.482 13H2.518a1.516 1.516 0 0 1-1.263-2.36l1.703-2.554A.255.255 0 0 0 3 7.947Zm5-3.5A3.5 3.5 0 0 0 4.5 5v2.947c0 .346-.102.683-.294.97l-1.703 2.556a.017.017 0 0 0-.003.01l.001.006c0 .002.002.004.004.006l.006.004.007.001h10.964l.007-.001.006-.004.004-.006.001-.007a.017.017 0 0 0-.003-.01l-1.703-2.554a1.745 1.745 0 0 1-.294-.97V5A3.5 3.5 0 0 0 8 1.5Z',
  fork: 'M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z',
  star: 'M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Zm0 2.445L6.615 5.5a.75.75 0 0 1-.564.41l-3.097.45 2.24 2.184a.75.75 0 0 1 .216.664l-.528 3.084 2.769-1.456a.75.75 0 0 1 .698 0l2.77 1.456-.53-3.084a.75.75 0 0 1 .216-.664l2.24-2.183-3.096-.45a.75.75 0 0 1-.564-.41L8 2.694Z',
  eye: 'M8 2c1.981 0 3.671.992 4.933 2.078 1.27 1.091 2.187 2.345 2.637 3.023a1.62 1.62 0 0 1 0 1.798c-.45.678-1.367 1.932-2.637 3.023C11.67 13.008 9.981 14 8 14c-1.981 0-3.671-.992-4.933-2.078C1.797 10.83.88 9.576.43 8.898a1.62 1.62 0 0 1 0-1.798c.45-.677 1.367-1.931 2.637-3.022C4.33 2.992 6.019 2 8 2ZM1.679 7.932a.12.12 0 0 0 0 .136c.411.622 1.241 1.75 2.366 2.717C5.176 11.758 6.527 12.5 8 12.5c1.473 0 2.825-.742 3.955-1.715 1.124-.967 1.954-2.096 2.366-2.717a.12.12 0 0 0 0-.136c-.412-.621-1.242-1.75-2.366-2.717C10.824 4.242 9.473 3.5 8 3.5c-1.473 0-2.825.742-3.955 1.715-1.124.967-1.954 2.096-2.366 2.717ZM8 10a2 2 0 1 1-.001-3.999A2 2 0 0 1 8 10Z',
  branch: 'M9.5 3.25a2.25 2.25 0 1 1 3 2.122V6A2.5 2.5 0 0 1 10 8.5H6a1 1 0 0 0-1 1v1.128a2.251 2.251 0 1 1-1.5 0V5.372a2.25 2.25 0 1 1 1.5 0v1.836A2.493 2.493 0 0 1 6 7h4a1 1 0 0 0 1-1v-.628A2.25 2.25 0 0 1 9.5 3.25Zm-6 0a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0Zm8.25-.75a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5ZM4.25 12a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Z',
  tag: 'M1 7.775V2.75C1 1.784 1.784 1 2.75 1h5.025c.464 0 .91.184 1.238.513l6.25 6.25a1.75 1.75 0 0 1 0 2.474l-5.026 5.026a1.75 1.75 0 0 1-2.474 0l-6.25-6.25A1.752 1.752 0 0 1 1 7.775Zm1.5 0c0 .066.026.13.073.177l6.25 6.25a.25.25 0 0 0 .354 0l5.025-5.025a.25.25 0 0 0 0-.354l-6.25-6.25a.25.25 0 0 0-.177-.073H2.75a.25.25 0 0 0-.25.25ZM6 5a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z',
  history: 'm.427 1.927 1.215 1.215a8.002 8.002 0 1 1-1.6 5.685.75.75 0 1 1 1.493-.154 6.5 6.5 0 1 0 1.18-4.458l1.358 1.358A.25.25 0 0 1 3.896 6H.25A.25.25 0 0 1 0 5.75V2.104a.25.25 0 0 1 .427-.177ZM7.75 4a.75.75 0 0 1 .75.75v2.992l2.028.812a.75.75 0 0 1-.557 1.392l-2.5-1A.751.751 0 0 1 7 8.25v-3.5A.75.75 0 0 1 7.75 4Z',
  dir: 'M1.75 1A1.75 1.75 0 0 0 0 2.75v10.5C0 14.216.784 15 1.75 15h12.5A1.75 1.75 0 0 0 16 13.25v-8.5A1.75 1.75 0 0 0 14.25 3H7.5a.25.25 0 0 1-.2-.1l-.9-1.2C6.07 1.26 5.55 1 5 1H1.75Z',
  file: 'M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0 1 13.25 16h-9.5A1.75 1.75 0 0 1 2 14.25Zm1.75-.25a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h9.5a.25.25 0 0 0 .25-.25V6h-2.75A1.75 1.75 0 0 1 9 4.25V1.5Zm6.75.062V4.25c0 .138.112.25.25.25h2.688l-.011-.013-2.914-2.914-.013-.011Z',
  book: 'M0 1.75A.75.75 0 0 1 .75 1h4.253c1.227 0 2.317.59 3 1.501A3.743 3.743 0 0 1 11.006 1h4.245a.75.75 0 0 1 .75.75v10.5a.75.75 0 0 1-.75.75h-4.507a2.25 2.25 0 0 0-1.591.659l-.622.621a.75.75 0 0 1-1.06 0l-.622-.621A2.25 2.25 0 0 0 5.258 13H.75a.75.75 0 0 1-.75-.75Zm7.251 10.324.004-5.073-.002-2.253A2.25 2.25 0 0 0 5.003 2.5H1.5v9h3.757a3.75 3.75 0 0 1 1.994.574ZM8.755 4.75l-.004 7.322a3.752 3.752 0 0 1 1.992-.572H14.5v-9h-3.495a2.25 2.25 0 0 0-2.25 2.25Z',
  law: 'M8.75.75V2h.985c.304 0 .603.08.867.231l1.29.736c.038.022.08.033.124.033h2.234a.75.75 0 0 1 0 1.5h-.427l2.111 4.692a.75.75 0 0 1-.154.838l-.53-.53.529.531-.001.002-.002.002-.006.006-.006.005-.01.01-.045.04c-.21.176-.441.327-.686.45C14.556 10.78 13.88 11 13 11a4.498 4.498 0 0 1-2.023-.454 3.544 3.544 0 0 1-.686-.45l-.045-.04-.016-.015-.006-.006-.004-.004v-.001a.75.75 0 0 1-.154-.838L12.178 4.5h-.162c-.305 0-.604-.079-.868-.231l-1.29-.736a.245.245 0 0 0-.124-.033H8.75V13h2.5a.75.75 0 0 1 0 1.5h-6.5a.75.75 0 0 1 0-1.5h2.5V3.5h-.984a.245.245 0 0 0-.124.033l-1.289.737c-.265.15-.564.23-.869.23h-.162l2.112 4.692a.75.75 0 0 1-.154.838l-.53-.53.529.531-.001.002-.002.002-.006.006-.016.015-.045.04c-.21.176-.441.327-.686.45C4.556 10.78 3.88 11 3 11a4.498 4.498 0 0 1-2.023-.454 3.544 3.544 0 0 1-.686-.45l-.045-.04-.016-.015-.006-.006-.004-.004v-.001a.75.75 0 0 1-.154-.838L2.178 4.5H1.75a.75.75 0 0 1 0-1.5h2.234a.249.249 0 0 0 .125-.033l1.288-.737c.265-.15.564-.23.869-.23h.984V.75a.75.75 0 0 1 1.5 0Zm2.945 8.477c.285.135.718.273 1.305.273s1.02-.138 1.305-.273L13 6.327Zm-10 0c.285.135.718.273 1.305.273s1.02-.138 1.305-.273L3 6.327Z',
  pulse: 'M6 2c.306 0 .582.187.696.471L10 10.731l1.304-3.26A.751.751 0 0 1 12 7h3.25a.75.75 0 0 1 0 1.5h-2.742l-1.812 4.528a.751.751 0 0 1-1.392 0L6 4.77 4.696 8.03A.75.75 0 0 1 4 8.5H.75a.75.75 0 0 1 0-1.5h2.742l1.812-4.529A.751.751 0 0 1 6 2Z',
  list: 'M5.75 2.5h8.5a.75.75 0 0 1 0 1.5h-8.5a.75.75 0 0 1 0-1.5Zm0 5h8.5a.75.75 0 0 1 0 1.5h-8.5a.75.75 0 0 1 0-1.5Zm0 5h8.5a.75.75 0 0 1 0 1.5h-8.5a.75.75 0 0 1 0-1.5ZM2 14a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm1-6a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM2 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z',
  kebab: 'M8 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM1.5 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm13 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z',
  copy: 'M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z',
  check: 'M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z',
  link: 'm7.775 3.275 1.25-1.25a3.5 3.5 0 1 1 4.95 4.95l-2.5 2.5a3.5 3.5 0 0 1-4.95 0 .751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018 1.998 1.998 0 0 0 2.83 0l2.5-2.5a2.002 2.002 0 0 0-2.83-2.83l-1.25 1.25a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042Zm-4.69 9.64a1.998 1.998 0 0 0 2.83 0l1.25-1.25a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042l-1.25 1.25a3.5 3.5 0 1 1-4.95-4.95l2.5-2.5a3.5 3.5 0 0 1 4.95 0 .751.751 0 0 1-.018 1.042.751.751 0 0 1-1.042.018 1.998 1.998 0 0 0-2.83 0l-2.5 2.5a1.998 1.998 0 0 0 0 2.83Z',
};
const icon = (name, size = 16, cls = '') => `<svg class="oi${cls ? ` ${cls}` : ''}" viewBox="0 0 16 16" width="${size}" height="${size}" aria-hidden="true"><path d="${P[name]}"></path></svg>`;
export const COPY_ICON = icon('copy');
export const CHECK_ICON = icon('check');
export const LINK_ICON_PATH = P.link;

const CSS = String.raw`
:root{--fs-ui:-apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji"}
html[data-color-mode=light]{color-scheme:light;--bg:#ffffff;--band:#f6f8fa;--fg:#1f2328;--muted:#59636e;--border:#d1d9e0;--border-muted:#d1d9e0b3;--accent:#0969da;--btn:#f6f8fa;--btn-hover:#eff2f5;--btn-border:#d1d9e0;--btn-fg:#25292e;--box-head:#f6f8fa;--folder:#54aeff;--underline:#fd8c73;--green:#1f883d;--green-border:rgba(31,35,40,.15);--counter:#818b981f;--code-bg:#f6f8fa;--backdrop:#e6eaef;--frame-shadow:0 0 0 1px #d1d9e0,0 16px 48px rgba(31,35,40,.18)}
html[data-color-mode=dark]{color-scheme:dark;--bg:#0d1117;--band:#010409;--fg:#f0f6fc;--muted:#9198a1;--border:#3d444d;--border-muted:#3d444db3;--accent:#4493f8;--btn:#212830;--btn-hover:#262c36;--btn-border:#3d444d;--btn-fg:#f0f6fc;--box-head:#151b23;--folder:#9198a1;--underline:#f78166;--green:#238636;--green-border:rgba(240,246,252,.1);--counter:#2f3742;--code-bg:#151b23;--backdrop:#000000;--frame-shadow:0 0 0 1px #3d444d,0 16px 48px rgba(0,0,0,.6)}
*{box-sizing:border-box}
html,body{margin:0}
body{background:var(--bg);color:var(--fg);font-family:"Mona Sans VF",var(--fs-ui);font-size:14px;line-height:1.5;-webkit-font-smoothing:antialiased}
.oi{display:inline-block;fill:currentColor;vertical-align:text-bottom;flex:none}
.muted{color:var(--muted)}
.gh-header{background:#000;color:#fff;height:72px;display:flex;align-items:center;padding:0 32px;gap:24px}
.gh-logo{color:#fff;display:flex}
.gh-mktg{display:flex;gap:0;margin-left:-8px;font-size:16px;font-weight:600;flex:1}
.gh-mktg span{display:flex;align-items:center;gap:6px;padding:6px 8px;border-radius:6px}
.gh-mktg .oi{opacity:.7}
.gh-hright{display:flex;gap:8px;align-items:center}
.gh-hbtn{height:32px;display:inline-flex;align-items:center;justify-content:center;padding:0 12px;border-radius:6px;border:1px solid #262c28;color:#fff;font-size:14px;font-weight:500;white-space:nowrap}
.gh-hbtn.icon{width:32px;padding:0}
.gh-hbtn.search{width:42px;padding:0}
.gh-hbtn.signup{background:rgba(255,255,255,.12);border-color:rgba(255,255,255,.06)}
.gh-band{background:var(--band);border-bottom:1px solid var(--border);padding:16px 16px 0}
.gh-crumbs{display:flex;align-items:center;height:32px;font-size:14px;line-height:24px}
.gh-crumbs span{padding:0 6px}
.gh-crumbs .sep{color:var(--muted);padding:0 2px}
.gh-crumbs b{font-weight:600}
.gh-tabs{display:flex;gap:8px;height:51px;align-items:center;white-space:nowrap;overflow:hidden}
.gh-tab{position:relative;display:flex;align-items:center;gap:8px;padding:0 8px;height:32px;border-radius:6px;font-size:14px}
.gh-tab .oi{color:var(--muted)}
.gh-tab.on{font-weight:600}
.gh-tab.on::after{content:"";position:absolute;left:0;right:0;bottom:-10px;height:2px;border-radius:6px;background:var(--underline)}
.gh-tab.more{margin-left:auto;border-left:1px solid var(--border);border-radius:0;padding-left:16px}
.gh-wrap{padding:0 32px;max-width:1280px;margin:0 auto}
.gh-title{display:flex;align-items:center;gap:8px;padding:20px 0 19px;border-bottom:1px solid var(--border)}
.gh-avatar{border-radius:50%;background:var(--counter);flex:none;object-fit:cover}
.gh-title strong{font-size:20px;font-weight:600;line-height:30px;word-break:break-word}
.gh-pill{font-size:12px;font-weight:500;line-height:18px;color:var(--muted);border:1px solid var(--border-muted);border-radius:2em;padding:0 7px}
.gh-actions{margin-left:auto;display:flex;gap:8px}
.gh-btn{height:28px;display:inline-flex;align-items:center;gap:6px;padding:0 8px;border:1px solid var(--btn-border);border-radius:6px;background:var(--btn);color:var(--btn-fg);font-size:12px;font-weight:500;white-space:nowrap}
.gh-btn .oi{color:var(--muted)}
.gh-btn.lg{height:32px;font-size:14px;padding:0 12px}
.gh-counter{display:inline-block;min-width:20px;padding:0 6px;border-radius:2em;background:var(--counter);font-size:12px;font-weight:500;line-height:18px;text-align:center;color:var(--fg)}
.gh-green{background:var(--green);border-color:var(--green-border);color:#fff}
.gh-green .oi{color:#fff}
.gh-layout{display:flex;gap:40px;padding-top:24px;align-items:flex-start}
.gh-main{flex:1;min-width:0}
.gh-side{width:272px;flex:none}
.gh-branchbar{display:flex;align-items:center;gap:16px;height:32px}
.gh-branchbar .meta{display:flex;gap:16px;font-size:14px;color:var(--muted)}
.gh-branchbar .meta b{color:var(--fg);font-weight:600}
.gh-goto{margin-left:auto;width:208px;height:32px;display:flex;align-items:center;gap:8px;padding:0 12px;border:1px solid var(--border);border-radius:6px;color:var(--muted);background:var(--bg)}
.gh-files{margin-top:16px;border:1px solid var(--border);border-radius:6px;overflow:hidden}
.gh-commit{display:flex;align-items:center;gap:8px;min-height:52px;padding:0 16px 0 14px;background:var(--box-head);font-size:14px}
.gh-commit b{font-weight:600}
.gh-commit .msg{color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.gh-commit .right{margin-left:auto;display:flex;align-items:center;gap:16px;font-size:12px;color:var(--muted);white-space:nowrap}
.gh-commit .right b{color:var(--fg);font-weight:600}
.gh-commit .kebab{display:inline-flex;padding:0 4px;border-radius:4px;background:var(--counter);color:var(--muted);height:16px;align-items:center}
.gh-row{display:grid;grid-template-columns:40% minmax(0,1fr) 120px;align-items:center;gap:16px;height:41px;padding:0 16px;border-top:1px solid var(--border);font-size:14px}
.gh-row .name{display:flex;align-items:center;gap:11px;min-width:0}
.gh-row .name span,.gh-row .msg{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.gh-row .oi.d{color:var(--folder)}
.gh-row .oi.f{color:var(--muted)}
.gh-row .msg,.gh-row .when{color:var(--muted)}
.gh-row .when{text-align:right}
.gh-row.all{display:flex;justify-content:center;color:var(--accent)}
.gh-readme{margin-top:16px;border:1px solid var(--border);border-radius:6px}
.gh-readme-head{display:flex;align-items:center;height:48px;padding:0 8px;border-bottom:1px solid var(--border)}
.gh-readme-head .gh-tab{height:32px}
.gh-readme-head .gh-tab.on::after{bottom:-9px}
.gh-readme-head .outline{margin-left:auto;width:32px;height:32px;display:flex;align-items:center;justify-content:center;color:var(--muted)}
.gh-readme-body{padding:32px}
.markdown-body{font-family:"Mona Sans VF",var(--fs-ui);background:transparent!important}
.markdown-body .sr-only{position:absolute;width:1px;height:1px;padding:0;overflow:hidden;clip:rect(0,0,0,0);word-wrap:normal;border:0}
/* Code blocks as github.com lays them out: a flex row, the <pre> shrinks to its content and scrolls, the copy button sits at the right. */
.markdown-body .highlight,.markdown-body .snippet-clipboard-content{display:flex;justify-content:space-between;position:relative;overflow:auto;background-color:var(--code-bg);border-radius:6px}
.markdown-body .snippet-clipboard-content{margin-bottom:16px}
.markdown-body .snippet-clipboard-content pre{margin-bottom:0}
.markdown-body .snippet-clipboard-content pre:has(+.zeroclipboard-container){min-height:52px}
.markdown-body .zeroclipboard-container{flex:none}
.markdown-body .pv-copy{display:flex;align-items:center;justify-content:center;width:28px;height:28px;margin:8px;padding:0;border:0;border-radius:6px;background:transparent;color:var(--muted);cursor:pointer}
.markdown-body .pv-copy:hover{background:var(--btn-hover)}
.markdown-body .pv-copy.done{color:#3fb950}
markdown-accessiblity-table{display:block}
html[data-color-mode=light] .markdown-body img[src$="#gh-dark-mode-only"],html[data-color-mode=dark] .markdown-body img[src$="#gh-light-mode-only"]{display:none}
.markdown-body .markdown-alert-title .octicon{margin-right:8px}
.gh-section{padding:16px 0;border-top:1px solid var(--border)}
.gh-section:first-child{border-top:0;padding-top:0}
.gh-section h2,.gh-about-m h2{margin:0 0 12px;font-size:16px;font-weight:600;line-height:24px;display:flex;align-items:center;gap:6px}
.gh-desc{font-size:16px;line-height:24px;margin:0 0 12px}
.gh-links{display:flex;flex-direction:column;gap:8px;color:var(--muted)}
.gh-links div{display:flex;align-items:center;gap:8px}
.gh-links b{color:var(--muted);font-weight:600}
.gh-links .inline{display:flex;gap:16px;flex-wrap:wrap}
.gh-links .inline span{display:flex;gap:8px;align-items:center}
.gh-topics{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 16px}
.gh-topics span{font-size:12px;font-weight:500;line-height:22px;padding:0 10px;border-radius:2em;color:var(--accent);background:color-mix(in srgb,var(--accent) 12%,transparent)}
.gh-small{font-size:12px;color:var(--muted)}
.gh-people{display:flex;align-items:center;gap:8px;margin-bottom:8px}
.gh-langbar{display:flex;height:8px;border-radius:6px;overflow:hidden;gap:2px;margin-bottom:8px}
.gh-langs{display:flex;flex-wrap:wrap;gap:4px 16px;font-size:12px}
.gh-langs span{display:flex;align-items:center;gap:6px}
.gh-langs i{width:8px;height:8px;border-radius:50%;display:inline-block}
.gh-langs b{font-weight:600}
.gh-about-m{display:none}
.gh-footer{display:flex;justify-content:center;align-items:center;flex-wrap:wrap;gap:8px 16px;padding:40px 16px 41px;margin-top:88px;font-size:12px;color:var(--muted)}
.gh-footer .copy{display:flex;align-items:center;gap:8px}
html:not(.pv-mobile) .mobile-only{display:none!important}
/* Desktop keeps GitHub's 1012px+ layout; the column is 838px at 1280px. */
html:not(.pv-mobile) #pv-frame{min-width:1012px}
/* Mobile: GitHub at a 375px viewport. */
html.pv-mobile body{background:var(--backdrop)}
html.pv-mobile #pv-frame{width:375px;margin:24px auto 96px;background:var(--bg);box-shadow:var(--frame-shadow);border-radius:14px;overflow:hidden}
html.pv-mobile.pv-narrow #pv-frame{width:100%;margin:0;border-radius:0;box-shadow:none}
html.pv-mobile.pv-narrow body{background:var(--bg)}
html.pv-mobile .desktop-only{display:none!important}
html.pv-mobile .gh-header{height:64px;padding:0 16px;gap:12px}
html.pv-mobile .gh-mktg{display:none}
html.pv-mobile .gh-logo{position:absolute;left:50%;transform:translateX(-50%)}
html.pv-mobile .gh-header{position:relative}
html.pv-mobile .gh-hright{margin-left:auto}
html.pv-mobile .gh-codebtn{margin-left:auto}
html.pv-mobile .gh-branchbar{gap:8px}
html.pv-mobile .gh-tabs{gap:0}
html.pv-mobile .gh-tab{padding:0 8px}
html.pv-mobile .gh-wrap{padding:0 16px}
html.pv-mobile .gh-title{flex-wrap:wrap;padding:16px 0 18px;row-gap:8px}
html.pv-mobile .gh-actions{margin-left:0;width:100%}
html.pv-mobile .gh-layout{flex-direction:column;gap:0;padding-top:0}
html.pv-mobile .gh-main,html.pv-mobile .gh-side{width:100%}
html.pv-mobile .gh-about-m{display:block;padding:16px 0 16px;border-bottom:1px solid var(--border);margin-bottom:24px}
html.pv-mobile .gh-side .gh-about{display:none}
html.pv-mobile .gh-side{padding-top:32px}
html.pv-mobile .gh-side .gh-section:nth-child(2){border-top:1px solid var(--border);padding-top:16px}
html.pv-mobile .gh-row{grid-template-columns:minmax(0,58%) minmax(0,1fr)}
html.pv-mobile .gh-codebtn>.oi:first-child{display:none}
html.pv-mobile .gh-row .msg{display:none}
html.pv-mobile .gh-row.extra{display:none}
html.pv-mobile .gh-commit{min-height:52px}
html.pv-mobile .gh-readme{margin:16px -16px 0;border-radius:6px}
html.pv-mobile .gh-readme-head .oi{display:none}
html.pv-mobile .gh-readme-head .outline .oi{display:inline-block}
html.pv-mobile .gh-footer{margin-top:56px;padding:40px 16px 40px;gap:0 16px;line-height:18px}
html.pv-mobile .gh-footer .copy{order:2;width:100%;justify-content:center;margin-top:12px}
/* Preview toolbar (not part of GitHub) */
#pv-toolbar{position:fixed;right:16px;bottom:16px;z-index:100;display:flex;align-items:center;gap:6px;padding:6px;border-radius:10px;background:rgba(22,27,34,.94);color:#e6edf3;font:12px/1.2 system-ui,-apple-system,"Segoe UI",sans-serif;box-shadow:0 0 0 1px rgba(240,246,252,.15),0 8px 24px rgba(0,0,0,.35)}
#pv-toolbar .grp{display:flex;background:rgba(240,246,252,.08);border-radius:7px;padding:2px}
#pv-toolbar button{all:unset;cursor:pointer;padding:5px 10px;border-radius:5px;color:#c9d1d9}
#pv-toolbar button[aria-pressed=true]{background:#f0f6fc;color:#0d1117;font-weight:600}
#pv-toolbar button:focus-visible{outline:2px solid #4493f8}
#pv-toolbar .info{padding:0 6px;color:#9198a1;white-space:nowrap}
#pv-toolbar .info b{color:#e6edf3;font-weight:600}
html.pv-shot #pv-toolbar{display:none}
@media (max-width:520px){#pv-toolbar .info{display:none}}
`;

const CLIENT_JS = String.raw`
(function () {
  var root = document.documentElement;
  function parse(h) {
    var t = String(h || '').replace(/^#/, '').toLowerCase().split(/[^a-z]+/);
    return { theme: t.indexOf('dark') >= 0 ? 'dark' : t.indexOf('light') >= 0 ? 'light' : null,
      device: t.indexOf('mobile') >= 0 ? 'mobile' : t.indexOf('desktop') >= 0 ? 'desktop' : null,
      shot: t.indexOf('shot') >= 0 };
  }
  function current() {
    var p = parse(location.hash);
    return { theme: p.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),
      device: p.device || (innerWidth < 768 ? 'mobile' : 'desktop'), shot: p.shot };
  }
  // A <source media="(prefers-color-scheme: dark)"> follows the GitHub theme, not the OS, so evaluate it ourselves.
  function matchesTheme(query, theme) {
    return query.split(',').some(function (part) {
      var ok = true;
      var rest = part.replace(/\(\s*prefers-color-scheme\s*:\s*(light|dark)\s*\)/gi, function (m, v) {
        if (v.toLowerCase() !== theme) ok = false; return '';
      }).replace(/\band\s+(?=and\b)/gi, '').replace(/^\s*(only\s+)?(and\s+)?|\s*(and\s*)?$/gi, '').trim();
      if (!ok) return false;
      if (!rest || /^(all|screen)$/i.test(rest)) return true;
      try { return matchMedia(rest).matches; } catch (e) { return true; }
    });
  }
  function themePictures(theme) {
    var sources = document.querySelectorAll('.markdown-body picture source');
    for (var i = 0; i < sources.length; i++) {
      var s = sources[i];
      if (!s.hasAttribute('data-pv-media')) {
        var m = s.getAttribute('media') || '';
        if (!/prefers-color-scheme/i.test(m)) continue;
        s.setAttribute('data-pv-media', m);
      }
      var want = matchesTheme(s.getAttribute('data-pv-media'), theme) ? 'all' : 'not all';
      if (s.getAttribute('media') !== want) s.setAttribute('media', want);
    }
  }
  function apply() {
    var s = current();
    root.setAttribute('data-color-mode', s.theme);
    root.classList.toggle('pv-mobile', s.device === 'mobile');
    root.classList.toggle('pv-narrow', innerWidth <= 420);
    root.classList.toggle('pv-shot', s.shot);
    var light = document.getElementById('pv-md-light'), dark = document.getElementById('pv-md-dark');
    if (light) light.media = s.theme === 'light' ? 'all' : 'not all';
    if (dark) dark.media = s.theme === 'dark' ? 'all' : 'not all';
    themePictures(s.theme);
    var bar = document.getElementById('pv-toolbar');
    if (bar) {
      var b = bar.querySelectorAll('button[data-set]');
      for (var i = 0; i < b.length; i++) {
        var kv = b[i].getAttribute('data-set').split('=');
        b[i].setAttribute('aria-pressed', String(s[kv[0]] === kv[1]));
      }
      requestAnimationFrame(function () {
        var art = document.querySelector('article.markdown-body');
        var out = document.getElementById('pv-width');
        if (art && out) out.textContent = Math.round(art.getBoundingClientRect().width) + 'px';
      });
    }
    return s;
  }
  function set(key, value) {
    var s = current();
    s[key] = value;
    var hash = s.theme + '-' + s.device + (s.shot ? '-shot' : '');
    history.replaceState(null, '', location.href.split('#')[0] + '#' + hash);
    apply();
  }
  window.pvApply = apply;
  apply();
  document.addEventListener('DOMContentLoaded', function () {
    apply();
    var bar = document.getElementById('pv-toolbar');
    bar.addEventListener('click', function (e) {
      var btn = e.target.closest('button[data-set]');
      if (!btn) return;
      var kv = btn.getAttribute('data-set').split('=');
      set(kv[0], kv[1]);
    });
    document.addEventListener('keydown', function (e) {
      if (e.ctrlKey || e.metaKey || e.altKey || /input|textarea/i.test(e.target.tagName)) return;
      var s = current();
      if (e.key === 't') set('theme', s.theme === 'dark' ? 'light' : 'dark');
      if (e.key === 'm') set('device', s.device === 'mobile' ? 'desktop' : 'mobile');
    });
    // In-page anchors: the <base> points at the repo root, so resolve #fragments here (GitHub prefixes ids with user-content-).
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var frag = decodeURIComponent(a.getAttribute('href').slice(1));
      e.preventDefault();
      var el = frag && (document.getElementById(frag) || document.getElementById('user-content-' + frag));
      if (el) el.scrollIntoView({ block: 'start' });
    });
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('.pv-copy');
      if (!btn) return;
      var text = btn.getAttribute('value') || '';
      var done = function () { btn.classList.add('done'); btn.innerHTML = btn.getAttribute('data-check'); setTimeout(function () { btn.classList.remove('done'); btn.innerHTML = btn.getAttribute('data-copy'); }, 1500); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, function () {});
      else { var ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); done(); } catch (err) {} ta.remove(); }
    });
  });
  addEventListener('hashchange', apply);
  addEventListener('resize', function () { root.classList.toggle('pv-narrow', innerWidth <= 420); });
})();
`;

function plural(n, word) { return `${n} ${word}${n === 1 ? '' : 's'}`; }

export function buildPage({ concept, readmeHtml, meta, repoRootUrl, localCss, renderer, now = Date.now() }) {
  const api = meta.api || {};
  const g = meta.git;
  const owner = api.owner || { login: meta.owner };
  const avatar = owner.avatar ? `${owner.avatar}${owner.avatar.includes('?') ? '&' : '?'}s=64` : '';
  const av = (size, cls = '') => (avatar ? `<img class="gh-avatar${cls}" src="${esc(avatar)}" width="${size}" height="${size}" alt="">` : `<span class="gh-avatar${cls}" style="width:${size}px;height:${size}px;display:inline-block"></span>`);
  const num = (n) => (typeof n === 'number' ? n : null);
  const stars = num(api.stars), forks = num(api.forks), watching = num(api.watching);

  const cssLink = (theme) => {
    const fallback = localCss && localCss[theme] ? ` onerror="this.onerror=null;this.href='${esc(localCss[theme])}'"` : '';
    return `<link rel="stylesheet" id="pv-md-${theme}" href="${MD_CSS_CDN[theme]}"${theme === 'dark' ? ' media="not all"' : ''}${fallback}>`;
  };

  const mktg = ['Platform', 'Solutions', 'Resources', 'Open Source', 'Enterprise'].map((t) => `<span>${t}${icon('caret')}</span>`).join('') + '<span>Pricing</span>';
  const header = `<header class="gh-header">
  <span class="mobile-only gh-hbtn icon" style="border:0">${icon('bars', 24)}</span>
  <span class="gh-logo">${icon('mark', 32)}</span>
  <nav class="gh-mktg">${mktg}</nav>
  <div class="gh-hright"><span class="gh-hbtn search desktop-only">${icon('search')}</span><span class="gh-hbtn">Sign in</span><span class="gh-hbtn signup desktop-only">Sign up</span><span class="gh-hbtn icon">${icon('sliders')}</span></div>
</header>`;

  const tabs = [['code', 'Code', true], ['issue', 'Issues'], ['pr', 'Pull requests'], ['play', 'Actions', false, 'desktop-only'], ['table', 'Projects', false, 'desktop-only'], ['shield', 'Security and quality', false, 'desktop-only'], ['graph', 'Insights', false, 'desktop-only']];
  const band = `<div class="gh-band">
  <div class="gh-crumbs"><span>${esc(meta.owner)}</span><span class="sep">/</span><span><b>${esc(meta.name)}</b></span></div>
  <nav class="gh-tabs">${tabs.map(([ic, label, on, cls]) => `<span class="gh-tab${on ? ' on' : ''}${cls ? ` ${cls}` : ''}"><span class="desktop-only" style="display:flex">${icon(ic)}</span>${label}</span>`).join('')}<span class="gh-tab more mobile-only">More ${icon('caret')}</span></nav>
</div>`;

  const title = `<div class="gh-title">
  ${av(24)}<strong>${esc(meta.name)}</strong><span class="gh-pill">${esc(meta.visibility || 'Public')}</span>
  <div class="gh-actions">
    <span class="gh-btn">${icon('bell')}Notifications</span>
    <span class="gh-btn">${icon('fork')}Fork${forks !== null ? ` <span class="gh-counter">${forks}</span>` : ''}</span>
    <span class="gh-btn desktop-only">${icon('star')}Star${stars !== null ? ` <span class="gh-counter">${stars}</span>` : ''}</span>
    <span class="gh-btn mobile-only" style="width:28px;justify-content:center;padding:0">${icon('star')}</span>
  </div>
</div>`;

  const statLine = (cls) => {
    const items = [];
    if (stars !== null) items.push(`<span>${icon('star')}<b>${stars}</b> ${stars === 1 ? 'star' : 'stars'}</span>`);
    if (watching !== null) items.push(`<span>${icon('eye')}<b>${watching}</b> watching</span>`);
    if (forks !== null) items.push(`<span>${icon('fork')}<b>${forks}</b> ${forks === 1 ? 'fork' : 'forks'}</span>`);
    if (!items.length) return '';
    return cls === 'inline' ? `<div class="inline">${items.join('')}</div>` : items.map((i) => `<div>${i.replace(/^<span>|<\/span>$/g, '')}</div>`).join('');
  };
  const about = (inline) => `<h2>About</h2>
  ${meta.description ? `<p class="gh-desc">${esc(meta.description)}</p>` : '<p class="gh-desc muted">No description, website, or topics provided.</p>'}
  ${api.topics && api.topics.length ? `<div class="gh-topics">${api.topics.map((t) => `<span>${esc(t)}</span>`).join('')}</div>` : ''}
  <div class="gh-links">
    <div>${icon('book')}Readme</div>
    ${meta.license ? `<div>${icon('law')}${esc(meta.license)}</div>` : ''}
    <div>${icon('pulse')}Activity</div>
    ${statLine(inline ? 'inline' : 'rows')}
    <div>Report repository</div>
  </div>`;

  const entries = g ? g.entries : [];
  const commitRow = g ? `<div class="gh-commit">${av(20)}<b>${esc(owner.login)}</b><span class="mobile-only muted" style="font-size:12px">${relativeTime(g.date, now)}</span><span class="msg desktop-only">${esc(g.subject)}</span><span class="kebab desktop-only">${icon('kebab', 12)}</span>
    <span class="right"><span class="desktop-only">${esc(g.short)} · ${relativeTime(g.date, now)}</span><span class="kebab mobile-only">${icon('kebab', 12)}</span><span style="display:flex;align-items:center;gap:6px">${icon('history')}<b class="desktop-only">${plural(g.commits, 'Commit')}</b></span></span></div>` : '';
  const rows = entries.map((e, k) => `<div class="gh-row${k >= 10 ? ' extra' : ''}"><span class="name">${icon(e.dir ? 'dir' : 'file', 16, e.dir ? 'd' : 'f')}<span>${esc(e.name)}</span></span><span class="msg">${esc(e.message)}</span><span class="when">${relativeTime(e.date, now)}</span></div>`).join('\n');
  const files = g ? `<div class="gh-files">${commitRow}\n${rows}${entries.length > 10 ? '<div class="gh-row all mobile-only">View all files</div>' : ''}</div>` : '';

  const branchbar = `<div class="gh-branchbar">
  <span class="gh-btn lg">${icon('branch')}<b style="font-weight:600">main</b>${icon('caret')}</span>
  ${g ? `<span class="meta desktop-only"><span>${icon('branch')} <b>${g.branches || 1}</b> ${g.branches === 1 ? 'Branch' : 'Branches'}</span><span>${icon('tag')} <b>${g.tags}</b> ${g.tags === 1 ? 'Tag' : 'Tags'}</span></span>` : ''}
  <span class="gh-goto desktop-only">${icon('search')}Go to file</span>
  <span class="gh-btn lg gh-green gh-codebtn">${icon('code')}<span style="font-weight:600">Code</span>${icon('caret')}</span>
  <span class="gh-btn lg mobile-only" style="width:32px;justify-content:center;padding:0">${icon('kebab')}</span>
</div>`;

  const sections = [];
  sections.push(`<div class="gh-section gh-about">${about(false)}</div>`);
  if (api.releases === 0) sections.push('<div class="gh-section"><h2>Releases</h2><div class="gh-small">No releases published</div></div>');
  else if (api.releases) sections.push('<div class="gh-section"><h2>Releases</h2></div>');
  if (api.contributors && api.contributors.length) {
    sections.push(`<div class="gh-section"><h2>Contributors <span class="gh-counter">${api.contributors.length}</span></h2>${api.contributors.length <= 3
      ? api.contributors.map((c) => `<div class="gh-people"><img class="gh-avatar" src="${esc(c.avatar)}&s=64" width="32" height="32" alt=""><b style="font-weight:600">${esc(c.login)}</b>${c.name ? `<span class="muted">${esc(c.name)}</span>` : ''}</div>`).join('')
      : `<div class="gh-people" style="flex-wrap:wrap;gap:4px">${api.contributors.slice(0, 14).map((c) => `<img class="gh-avatar" src="${esc(c.avatar)}&s=64" width="32" height="32" alt="">`).join('')}</div>`}</div>`);
  }
  if (api.languages && api.languages.length) {
    sections.push(`<div class="gh-section"><h2>Languages</h2><div class="gh-langbar">${api.languages.map((l) => `<span style="width:${l.pct}%;background:${l.color}"></span>`).join('')}</div><div class="gh-langs">${api.languages.map((l) => `<span><i style="background:${l.color}"></i><b>${esc(l.name)}</b><span class="muted">${l.pct.toFixed(1)}%</span></span>`).join('')}</div></div>`);
  }

  const readme = `<div class="gh-readme" id="readme">
  <div class="gh-readme-head"><span class="gh-tab on">${icon('book')}README</span>${meta.license ? `<span class="gh-tab">${icon('law')}${esc(meta.license)}</span>` : ''}<span class="outline">${icon('list')}</span></div>
  <div class="gh-readme-body"><article class="markdown-body entry-content container-lg" itemprop="text">
${readmeHtml}
  </article></div>
</div>`;

  const year = new Date(now).getFullYear();
  const footer = `<footer class="gh-footer"><span class="copy">${icon('mark', 24)}© ${year} GitHub, Inc.</span>${['Terms', 'Privacy', 'Security', 'Status', 'Community', 'Docs', 'Contact', 'Manage cookies', 'Do not share my personal information'].map((t) => `<span>${t}</span>`).join('')}</footer>`;

  const toolbar = `<div id="pv-toolbar" role="toolbar" aria-label="Preview options">
  <span class="info"><b>${esc(concept)}</b> · README <span id="pv-width">…</span> · ${esc(renderer)}</span>
  <span class="grp"><button type="button" data-set="theme=light" title="Light (t)">Light</button><button type="button" data-set="theme=dark" title="Dark (t)">Dark</button></span>
  <span class="grp"><button type="button" data-set="device=desktop" title="Desktop (m)">Desktop</button><button type="button" data-set="device=mobile" title="Mobile 375px (m)">Mobile</button></span>
</div>`;

  return `<!doctype html>
<html lang="en" data-color-mode="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(concept)} · README preview · ${esc(meta.owner)}/${esc(meta.name)}</title>
<base href="${esc(repoRootUrl)}">
${cssLink('light')}
${cssLink('dark')}
<style>${CSS}</style>
<script>${CLIENT_JS}</script>
</head>
<body>
<div id="pv-frame">
${header}
${band}
<div class="gh-wrap">
${title}
<div class="gh-layout">
  <div class="gh-main">
    <div class="gh-about-m">${about(true)}</div>
    ${branchbar}
    ${files}
    ${readme}
  </div>
  <aside class="gh-side">${sections.join('\n')}</aside>
</div>
</div>
${footer}
</div>
${toolbar}
</body>
</html>
`;
}
