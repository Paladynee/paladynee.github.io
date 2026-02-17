/// Re-exports and macro-generated wrappers for functions exposed to JavaScript.
use crate::exports::GlobalState;
use crate::exports::Vec2f;

macro_rules! externs {
    {$(
        $(#[unsafe($Ty:ty)])?
        fn $SymbolName:ident($(
            $ArgName:ident: $ArgType:ty
        ),* $(,)?) $(-> $RetTy:ty)?;
    )*} => {$(
        mod $SymbolName;

        #[unsafe(export_name = ::core::stringify!($SymbolName))]
        #[allow(unused)]
        extern "C" fn $SymbolName($($ArgName: $ArgType),*) $(-> $RetTy)? {
            $SymbolName::$SymbolName(
                $(unsafe { <$Ty>::get_mut() },)?
                $($ArgName),*)
        }
    )*};
}

externs! {
    #[unsafe(GlobalState)]
    fn init_lib(screen_width: f32, screen_height: f32, entropy: f64, entropy2: f64);

    #[unsafe(GlobalState)]
    fn update_mouse_pos(x: f32, y: f32);

    #[unsafe(GlobalState)]
    fn get_mouse_pos() -> *const Vec2f;

    #[unsafe(GlobalState)]
    fn get_draw_pointers() -> *const [*mut f32; 4];

    #[unsafe(GlobalState)]
    fn update_canvas_size(width: f32, height: f32);

    #[unsafe(GlobalState)]
    fn update_physics(dt: f32);

    #[unsafe(GlobalState)]
    fn update_keys(
        k0: u32,
        k1: u32,
        k2: u32,
        k3: u32,
    );

    #[unsafe(GlobalState)]
    fn update_mouse_buttons(mask: u32);

    #[unsafe(GlobalState)]
    fn handle_continuous_controls();    

    #[unsafe(GlobalState)]
    fn tactile_keyboard_event(code: u32);

    fn get_amount_objects() -> i32;

    #[unsafe(GlobalState)]
    fn get_color_pointers() -> *const [*mut u8; 3];

    #[unsafe(GlobalState)]
    fn reset_palette();
}
