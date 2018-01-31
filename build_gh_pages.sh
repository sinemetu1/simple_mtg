jekyll build
mv _site ..
gh=$(git checkout gh-pages)
if [[ $? != 0 ]] ; then
    echo "Error occurred check output.";
    exit 1;
fi
rm -rf ./*
mv ../_site/* .
git add .
