<template>
  <div class="relative">
    <div
      @click="toggleOpen"
      :class="[
        isOpend ? 'bg-red-500 text-white' : 'bg-white text-gray-700',
      ]"
      class="rounded-full flex items-center justify-center w-[24px] h-[24px] cursor-pointer transition-all duration-300 relative"
    >
      <span
        class="icon-plus text-sm transition-transform duration-300"
      >{{ isOpend ? 'x' : '+'}}</span>
    </div>

    <!-- options -->
    <!-- <Transition name="come-from-in-to-out" mode="in-out"> -->
      <div
        v-if="isOpend"
        class="absolute top-[50px] start-[55%] z-10 transition-transform duration-300 bg-red-950"
      >
        <!-- arrow option node -->
        <div
          class="option-node shadow-md rounded-full w-[36px] h-[36px] flex items-center justify-center absolute bottom-0 z-10 translate-x-[-50%] left-[-50px] cursor-pointer"
        >
          <svg
            width="21"
            height="22"
            viewBox="0 0 21 22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6.125 3.91016C5.84886 3.91016 5.625 4.13401 5.625 4.41016C5.625 4.6863 5.84886 4.91016 6.125 4.91016V3.91016ZM13.6464 17.9161C13.8417 18.1113 14.1583 18.1113 14.3536 17.9161L17.5355 14.7341C17.7308 14.5388 17.7308 14.2222 17.5355 14.027C17.3403 13.8317 17.0237 13.8317 16.8284 14.027L14 16.8554L11.1716 14.027C10.9763 13.8317 10.6597 13.8317 10.4645 14.027C10.2692 14.2222 10.2692 14.5388 10.4645 14.7341L13.6464 17.9161ZM6.125 4.91016H6.98438V3.91016H6.125V4.91016ZM8.70312 4.91016H10.4219V3.91016L8.70312 3.91016V4.91016ZM12.1406 4.91016H13V3.91016H12.1406V4.91016ZM13 4.91016C13.0687 4.91016 13.133 4.92374 13.1913 4.9479L13.5743 4.02417C13.3968 3.95054 13.2025 3.91016 13 3.91016V4.91016ZM13.4623 5.2189C13.4864 5.27716 13.5 5.34144 13.5 5.41016H14.5C14.5 5.20769 14.4596 5.0134 14.386 4.83584L13.4623 5.2189ZM13.5 5.41016V6.31161H14.5V5.41016H13.5ZM13.5 8.11453V9.01599H14.5V8.11453H13.5ZM13.5 9.01599V9.7282H14.5V9.01599H13.5ZM13.5 11.1526V12.577H14.5V11.1526H13.5ZM13.5 14.0015V15.4259H14.5V14.0015H13.5ZM13.5 16.8503V17.5625H14.5V16.8503H13.5Z"
              fill="#12B669"
            />
          </svg>
        </div>

        <!-- rectangular option node (add step) -->
        <div
          @click="addStep"
          class="option-node shadow-md rounded-full w-[36px] h-[36px] flex items-center justify-center absolute bottom-0 z-10 translate-x-[-50%] top-[5px] cursor-pointer"
        >
          <svg
            width="21"
            height="22"
            viewBox="0 0 21 22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clip-path="url(#clip0_3282_201958)">
              <path
                d="M3.5 7.4987C3.5 7.18928 3.67072 6.89253 3.9746 6.67374C4.27847 6.45495 4.69062 6.33203 5.12037 6.33203H16.463C16.8927 6.33203 17.3049 6.45495 17.6087 6.67374C17.9126 6.89253 18.0833 7.18928 18.0833 7.4987V15.6654C18.0833 15.9748 17.9126 16.2715 17.6087 16.4903C17.3049 16.7091 16.8927 16.832 16.463 16.832H5.12037C4.69062 16.832 4.27847 16.7091 3.9746 16.4903C3.67072 16.2715 3.5 15.9748 3.5 15.6654V7.4987Z"
                stroke="#12B669"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </g>
            <defs>
              <clipPath id="clip0_3282_201958">
                <rect
                  width="21"
                  height="21"
                  fill="white"
                  transform="translate(0 0.5)"
                />
              </clipPath>
            </defs>
          </svg>
        </div>

        <!-- Rhombic option node -->
        <div
          @click="addDecision"
          class="option-node shadow-md rounded-full w-[36px] h-[36px] flex items-center justify-center absolute bottom-0 z-10 end-[-60px] cursor-pointer"
        >
          <svg
            width="25"
            height="24"
            viewBox="0 0 25 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clip-path="url(#clip0_3282_201945)">
              <path
                d="M21.5 12L12.5 3L3.5 12L12.5 21L21.5 12Z"
                stroke="#1BC457"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </g>
            <defs>
              <clipPath id="clip0_3282_201945">
                <rect
                  width="24"
                  height="24"
                  fill="white"
                  transform="translate(0.5)"
                />
              </clipPath>
            </defs>
          </svg>
        </div>
      </div>
    <!-- </Transition> -->
  </div> </template>

<script setup>
import { ref } from 'vue';

// 1. Start in the "open" state so options are visible immediately.
const isOpend = ref(true);

// 2. Add 'close' to the list of emitted events.
const emit = defineEmits(['addStep', 'addDecision', 'close']);

// 3. When the 'x' button is clicked, tell the parent component to close (hide) this one.
const toggleOpen = () => {  isOpend.value = !isOpend.value;

  emit('close');
};

const addStep = () => {
  // isOpend.value = false; // No longer needed, parent will hide it.
  emit('addStep');
};

const addDecision = () => {
  // isOpend.value = false; // No longer needed, parent will hide it.
  emit('addDecision');
};
// const toggleOpen = () => {
//   emit('close');
// };
</script>

<style scoped>
.come-from-in-to-out-enter-active,
.come-from-in-to-out-leave-active {
  transition: transform 0.3s ease-in-out;
}

.come-from-in-to-out-enter-from,
.come-from-in-to-out-leave-to {
  transform: scale(0);
}
.option-node {
  background-color: white;
  transition: all 0.3s ease-in-out;
}
.option-node:hover {
  background-color: #1ed760;
}
.option-node:hover svg {
  stroke: white;
}
.option-node:hover svg path {
  stroke: white;
}
</style>