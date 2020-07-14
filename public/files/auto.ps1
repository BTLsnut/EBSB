Set-Location -Path C:\Users\dkssh\Desktop\test\omni1 # set video path
Set-ExecutionPolicy -ExecutionPolicy AllSigned
$path=dir
$videop=$path.Basename

foreach ($video in $videop)
{
    $v_dir = Join-Path (Get-Location).Path $video
    New-Item -Path . -Name $video  -ItemType "directory" -Force

    ffmpeg -i $video".mp4" -c:a aac -ac 2 -ab 128k -vn $v_dir"\"$video"_audio.mp4"

    ffmpeg -i $video".mp4" -an -c:v libx264 -preset slow -b:v 8000k -vf scale=-1:1920 $v_dir"\"$video"_1920.264"
    ffmpeg -i $video".mp4" -an -c:v libx264 -preset slow -b:v 4500k -vf scale=-1:1080 $v_dir"\"$video"_1080.264"
    ffmpeg -i $video".mp4" -an -c:v libx264 -preset slow -b:v 2700k -vf scale=-1:720 $v_dir"\"$video"_720.264"
    ffmpeg -i $video".mp4" -an -c:v libx264 -preset slow -b:v 1200k -vf scale=-1:480 $v_dir"\"$video"_480.264"

    MP4Box -add $v_dir"\"$video"_1920.264" $v_dir"\"$video"_e_1920.mp4"
    MP4Box -add $v_dir"\"$video"_1080.264" $v_dir"\"$video"_e_1080.mp4"
    MP4Box -add $v_dir"\"$video"_720.264" $v_dir"\"$video"_e_720.mp4"
    MP4Box -add $v_dir"\"$video"_480.264" $v_dir"\"$video"_e_480.mp4"

    $dash_dir = Join-Path $v_dir "dash"
    if ( -not (Test-Path $dash_dir))
    {
        New-Item -ItemType directory -Path $v_dir -Name "dash" -Force
    }
    MP4Box -dash 4000 -frag 4000 -bs-switching no -rap -segment-name %s_ -out $dash_dir"\"$video"_dash.mpd" $v_dir"\"$video"_e_1920.mp4" $v_dir"\"$video"_e_1080.mp4" $v_dir"\"$video"_e_720.mp4" $v_dir"\"$video"_e_480.mp4" $v_dir"\"$video"_audio.mp4"
}
