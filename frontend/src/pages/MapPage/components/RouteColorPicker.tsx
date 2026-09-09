interface RouteColorPickerProps {
    color: string;
    onChange: (color: string) => void;
}

function RouteColorPicker({
                              color,
                              onChange,
                          }: RouteColorPickerProps) {
    return (
        <div>
            <input
                type="color"
                id="route-color"
                name="route-color"
                value={color}
                onChange={(e) => onChange(e.target.value)}
            />

            <label htmlFor="route-color">
                Route color
            </label>
        </div>
    );
}

export default RouteColorPicker;
