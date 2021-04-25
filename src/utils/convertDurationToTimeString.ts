export function convertDurationToTimeString(duration: number){
    const hours = Math.floor(duration / 3600 )
    const minutes = Math.floor((duration % 3600) / 60)
    const seconds = duration % 60;

    const timeString = [hours, minutes, seconds]
        .map(unit => String(unit).padStart(2,'0'))// se a hora contiver somente 1 hora, ele adc um "0" na 
        .join(':')

        return timeString;
}