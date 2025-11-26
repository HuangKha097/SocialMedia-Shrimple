import {create} from "zustand";
import {persist} from "zustand/middleware";

export const useThemeStore = create(
    persist(
        (set, get) => ({
            // State khởi tạo
            isLight: false,

            // Action: Chuyển đổi qua lại giữa sáng/tối
            toggleTheme: () => {
                const newValue = !get().isLight;
                set({isLight: newValue});

                if (newValue) {
                    document.documentElement.classList.add("light");
                }else {
                    document.documentElement.classList.remove("light");
                }
            },

            //set cụ thể true/false
            setTheme: (value) => set({isLight: value}),
        }),
        {
            name: "theme-storage",
        }
    )
);