# Instructions to build the widget's development distribution
```
yarn install
cp -a js dist
parcel watch index.html & python3 -m http.server
xdg-open localhost:8000/dist/index.html
```
