import { Colors, FontSize } from '@/constants/theme';
import React from 'react';
import { Image, ImageSourcePropType, Pressable, ScrollView, StyleSheet, Text, useColorScheme, View } from 'react-native';

type CategoryProp = {
    id: string
    catIcon: ImageSourcePropType;
    catName: string;
}

const CatData: CategoryProp[] = [
    {
        id: "electronics",
        catIcon: require("../../assets/images/Category/electronics.png"),
        catName: "Electronics"
    },
    {
        id: "academics",
        catIcon: require("../../assets/images/Category/academics.png"),
        catName: "Books & Acedemics"
    },
        {
        id: "fashion",
        catIcon: require("../../assets/images/Category/fashion.png"),
        catName: "Fashion & Clothing"
    },
        {
        id: "hostel",
        catIcon: require("../../assets/images/Category/hostel.png"),
        catName: "Hostel & Rooms"
    },
        {
        id: "beauty",
        catIcon: require("../../assets/images/Category/beauty.png"),
        catName: "Beauty & Care"
    },
        {
        id: "food",
        catIcon: require("../../assets/images/Category/food.png"),
        catName: "Food & Snacks"
    },
        {
        id: "services",
        catIcon: require("../../assets/images/Category/service.png"),
        catName: "Services"
    },
        {
        id: "accessories",
        catIcon: require("../../assets/images/Category/accessories.png"),
        catName: "Accessories"
    },
        {
        id: "sport",
        catIcon: require("../../assets/images/Category/sport.png"),
        catName: "Sports & Fitness"
    },
        {
        id: "furniture",
        catIcon: require("../../assets/images/Category/furniture.png"),
        catName: "Furniture"
    },
        {
        id: "vehicle",
        catIcon: require("../../assets/images/Category/vehicle.png"),
        catName: "Vehicles"
    },
        {
        id: "others",
        catIcon: require("../../assets/images/Category/others.png"),
        catName: "Others"
    },
]

const CategoryScreen = () => {
    const scheme = useColorScheme();
    const themeSize = FontSize.size;
    const theme = scheme ==="dark" ? Colors.dark : Colors.light
  return (
    <View style={{backgroundColor: theme.screenBackground, flex: 1, paddingLeft: 10, paddingRight: 10}}>
      <View style={[style.cat_h,{borderColor: "#aeaeaea1"}]}>
        <Text style={{textAlign: "center", alignSelf: "center", flex: 1, color: theme.text, fontSize: themeSize.md, fontWeight: "700"}}>Categories</Text>
        <Pressable>
            <Image source={require("../../assets/images/HomeScreen/search.png")} style={{tintColor: theme.text}}/>
        </Pressable>
      </View> 
      <ScrollView
        horizontal= {true}
        
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={style.cat_list}
      >
        {/** cat 1 */}
        {CatData.map((item) => (
        <View key={item.id} style={{flexDirection: "column", gap: 15, padding: 30, borderWidth: 1,  borderColor: "#4241412c", width: 165, height: 128, justifyContent: "center", alignItems: "center", borderRadius: 20, backgroundColor: theme.sectionBackground}}>
            <View style={{width: 56, height: 56, borderRadius: 50, backgroundColor: "#2ecc702f", justifyContent: "center", alignItems: "center"}}>
                <Image source={item.catIcon} />
            </View>
            <Text style={{textAlign: "center", color: theme.text, fontWeight: '600'}}>{item.catName}</Text>
        </View>
        ))}

      </ScrollView>
    </View>
  )
}

export default CategoryScreen;

const style = StyleSheet.create({
    cat_h: {
        padding: 20,
        flexDirection: "row",
        
        justifyContent: "space-between",
        borderBottomWidth: 1,
        gap: 20
    },
    cat_list: {
      gap: 20,
      marginTop: 20,    
      flexDirection: "column",
      flexWrap: "wrap",
      height: 590,
    }
})