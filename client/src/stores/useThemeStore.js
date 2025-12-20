import {create} from "zustand";
import {persist} from "zustand/middleware";

export const useThemeStore = create(
    persist(
        (set, get) => ({
            // State khởi tạo
            isLight: false,
            primaryColor: "#e56d32",

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

            setPrimaryColor: (color) => {
                set({primaryColor: color});
                document.documentElement.style.setProperty("--primary-color", color);
            },
        }),
        {
            name: "theme-storage",
            onRehydrateStorage: () => (state) => {
                if (state) {
                    // Re-apply theme class
                    if (state.isLight) {
                        document.documentElement.classList.add("light");
                    } else {
                         document.documentElement.classList.remove("light");
                    }
                    // Re-apply primary color
                    if (state.primaryColor) {
                        document.documentElement.style.setProperty("--primary-color", state.primaryColor);
                    }
                }
            }
        }
    )
);