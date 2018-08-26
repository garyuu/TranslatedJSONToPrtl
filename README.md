# TranslatedJSONToPrtl

1. 準備一個翻譯好的json字幕檔
2. `npm run create < *filename*.json`
3. 不需處理的字幕檔會生成在`output`
4. 需處理置中的字幕檔會生成在`output/raw_0`，同時生成一個`list.json`記錄這些檔案
5. 將 4. 的檔案傳進 Premiere 處理完後，以同檔名 export 覆蓋`output/raw_0`的檔案
6. `npm run middle`
7. 所有字幕已生成在`output`
