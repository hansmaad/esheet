import { LineChart, FixedScaleAxis } from 'chartist';

export function createChart(values) {

    const e = document.createElement('div');
    e.classList = 'ct-chart ct-golden-section';

    const gasConsumption = values.slice(1).map((v, i) => {
        const ticks = (v.date - values[i].date) || 1;
        const days = ticks / 1000 / 3600 / 24;
        const gas = v.gas - values[i].gas;
        return { x: v.date, y: gas / days };
    });

    new LineChart(
        e,
        {
            series: [
                {
                    name: 'Gas',
                    data: gasConsumption
                },
            ]
        },
        {
            axisX: {
                type: FixedScaleAxis,
                divisor: 5,
                labelInterpolationFnc: value =>
                    new Date(value).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric'
                    })
            }
        }
    );

    return e;
    // return '<div>C</div>';
}