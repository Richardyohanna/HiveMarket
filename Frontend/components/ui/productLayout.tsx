import { Colors, generalStyle, PRIMARY, PRIMARY_DARK, PRIMARY_SOFT, RECENT_PREVIEW_COUNT } from "@/constants/theme";
import { chatSocketService } from "@/src/api/chatSocket";
import { addReactionApi } from "@/src/api/productApi";
import { useCartStore } from "@/src/store/cartStore";
import { userStore } from "@/src/store/userStore";
import { ReactionResponse, RecentListingItem } from "@/src/types/products";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Pressable,
  Text,
  View
} from "react-native";

// ─── Types ────────────────────────────────────────────────────────────────────
type GridBlock  = { type: "grid";         items: RecentListingItem[]; key: string };
type StripBlock = { type: "recent_strip"; items: RecentListingItem[]; key: string };
export type FeedBlock  = GridBlock | StripBlock;

// ─── Module-level key counter — unique across all renders & HMR reloads ───────
let _keyCounter = 0;
const nextKey = (t: "g" | "s") => `${t}_${++_keyCounter}_${Date.now()}`;

// ─── Pure helpers ─────────────────────────────────────────────────────────────
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function buildBlock(
  all: RecentListingItem[],
  seed: number[],
  offset: number,
): [GridBlock, StripBlock] {
  const len       = seed.length;
  const gridItems = Array.from({ length: seed.length }, (_, i) => //length: PRODUCTS_PER_BLOCK 
    all[seed[(offset + i) % len]]
  );
  const stripItems = shuffle(all).slice(0, RECENT_PREVIEW_COUNT);
  return [
    { type: "grid",         items: gridItems,  key: nextKey("g") },
    { type: "recent_strip", items: stripItems, key: nextKey("s") },
  ];
}

// ─── Sub-components (all defined OUTSIDE main so hook count is constant) ──────

export const ProductCard = React.memo(({
  item, isDark, theme, onPress,
}: {
  item: RecentListingItem;
  isDark: boolean;
  theme: typeof Colors.light;
  onPress: () => void;
}) => {

  const { email: currentUserEmail, id: currentUserId } = userStore();
  const cart = useCartStore.getState();  

  const {addToCart, isInCart } = cart;

  const [addedToCart, setAddedToCart] = useState(false);
  const [reactionCount, setReactionCount] = useState(0);
  const [reacted, setReacted] = useState(false);
  const [serverReaction, setServerReaction] = useState<ReactionResponse | null>(null);




  const isNew = item.pQuality === "NEW";





  //console.log("this is the reaction data in the product layout", reactionData);

  const addToCarts = () => {

    if(item.sellerEmail == null || currentUserEmail == null || currentUserEmail == "") {
     
      setAddedToCart(false);
      Alert.alert("Login Required","Please login to add items to your cart.", [{text: "Login", onPress: () => router.push("/Login/LoginScreen")}, {text: "Cancel", style: "cancel"}]);
      return
    };

    setAddedToCart(true);

   if(isInCart(item.id)) {

    alert("This item is already in your cart.");
    return;
   }
    
    addToCart(currentUserEmail,item.id,item.sellerEmail);
  }



useEffect(() => {

  console.log("Initializing reaction state for product:", item.id, "with isReacted:", item.isReacted, "and reactions:", item.reactions);
  setReacted(item.isReacted);
  setReactionCount(item.reactions || 0);
}, [item.reactions]);


useEffect(() => {

  if(!chatSocketService.isConnected()) return;

  const unsubscribe = chatSocketService.updateProduct(item.id, (data) => {
    console.log("Received product update:", data);

    if(data.userId === currentUserId) {
      console.log("Received reaction update for current user, updating local state");
      setServerReaction(data);
      setReactionCount(data.reactions);
      // setReacted(data.isReacted);
    } else {
      setReactionCount(data.reactions);
    }
  }) as (() => void) | undefined;

  return () => {
    if (unsubscribe) {
      unsubscribe();
    }
  };

}, [item.id]);




const handleReaction = () => {

  if (!currentUserId) {

    Alert.alert("Login Required","Please login to react to products.", [{text: "Login", onPress: () => router.push("/Login/LoginScreen")}, {text: "Cancel", style: "cancel"}]);
  //("User ID is not available for reactions");
    return;
  }

console.log("Is Reacted before toggle:", reacted);
const nextReacted = !reacted;

console.log("Is Reacted before toggle:", nextReacted);

setReacted(nextReacted);

setReactionCount(prev =>
  nextReacted ? prev + 1 : prev - 1
);

  const reactionData = {

    productId: item.id,
    userId: currentUserId,

  }

  console.log("Preparing to send reaction data:", reactionData);
  console.log("isReacted state at reaction time:", reacted);
  
   console.log("Reaction data:", reactionData);

   addReactionApi(reactionData, (data) => {
    console.log("Reaction updated:", data);
   // setServerReaction(data);
    //
  }).catch((err) => {
    console.error("Failed to update reaction:", err);
    // Optionally revert UI state here if the API call fails
  });



  //setReacted(false);

};

console.log("Rendering ProductCard for item:", item.id, "with reactions:", reactionCount, "and reacted state:", reacted);

const handleAddToCart = () => {
  addToCarts();
  
};

  return (
    <Pressable
      onPress={onPress}
      style={[generalStyle.card, {
        backgroundColor: theme.productColor,
        borderColor: isDark ? PRIMARY_DARK : "#e4f0e4",
      }]}
    >
      <View style={generalStyle.cardImgWrapper}>
        <Image
          source={item.pImage ? { uri: item.pImage } : require("../../assets/images/HomeScreen/nike.png")}
          style={generalStyle.cardImg}
          resizeMode="cover"
        />
        {item.pQuality && (
          <View style={[generalStyle.conditionPill, { backgroundColor: isNew ? PRIMARY : "#b45309" }]}>
            <Text style={generalStyle.conditionText}>{item.pQuality}</Text>
          </View>
        )}

        <Pressable
          onPress={handleReaction}
          style={[
            generalStyle.wishlistBtn,
            {
              backgroundColor: isDark ? "#0f1f0f" : "#fff",
              flexDirection: "row",
              alignItems: "center",
              gap: 3,
              paddingHorizontal: reactionCount > 0 ? 8 : undefined,
              width: reactionCount > 0 ? undefined : 32,
            },
          ]}
        >
          <Text style={{ fontSize: 13 }}>{reacted ? "❤️" : "🤍"}</Text>{/**reacted <-- that was the former logic */}
          {reactionCount > 0 && (
            <Text style={{ fontSize: 10, fontWeight: "700", color: reacted ? "#e53935" : theme.readColor }}>
              {reactionCount}
            </Text>
          )}
        </Pressable>
      </View>

      <View style={[generalStyle.cardBody,{ backgroundColor: theme.productColor} ]}>
        <Text numberOfLines={2} style={[generalStyle.cardName, { color: theme.text }]}>
          {item.pName}
        </Text>
        {item.location ? (
          <View style={generalStyle.locationRow}>
            <Text style={[generalStyle.locationPin, { color: PRIMARY }]}>📍</Text>
            <Text numberOfLines={1} style={[generalStyle.locationText, { color: theme.readColor }]}>
              {item.location}
            </Text>
          </View>
        ) : null}
        <Text style={[generalStyle.cardPrice, { color: PRIMARY }]}>
          ₦{Number(item.pAmount).toLocaleString()}
        </Text>
        <View style={generalStyle.metaRow}>
          <Text style={generalStyle.star}>★</Text>
          <Text style={[generalStyle.ratingVal, { color: theme.readColor }]}>
            {Number(item.rating || 0).toFixed(1)}
          </Text>
          {(item.views ?? 0) > 0 && (
            <Text style={[generalStyle.viewCount, { color: theme.readColor }]}>
              · {item.views} views
            </Text>
          )}
        </View>




        <View style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
          <Pressable style={[generalStyle.buyBtn, { flex: 1 }]} onPress={onPress}>
            <Text style={generalStyle.buyBtnText}>Buy Now</Text>
          </Pressable>

          <Pressable
            onPress={handleAddToCart}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              paddingHorizontal: 10,
              paddingVertical: 8,
              borderRadius: 9,
              borderWidth: 1,
              borderColor: addedToCart ? PRIMARY : (isDark ? "#2e4a2e" : "#c8e6c9"),
              backgroundColor: addedToCart ? (isDark ? "#0f2e0f" : "#e8f5e9") : "transparent",
            }}
          >
            <Text style={{ fontSize: 14 }}>{addedToCart ? "✅" : "🛒"}</Text>
            <Text style={{ fontSize: 10, fontWeight: "700", color: PRIMARY }}>
              {addedToCart ? "Added" : "Add"}
            </Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}, (p, n) => p.item.id === n.item.id && p.isDark === n.isDark);

export const RecentStrip = React.memo(({
  items, isDark, theme, onPress,
}: {
  items: RecentListingItem[];
  isDark: boolean;
  theme: typeof Colors.light;
  onPress: (id: string) => void;
}) => (
  <View style={[generalStyle.stripOuter, { backgroundColor: isDark ? PRIMARY_DARK : PRIMARY_SOFT }]}>
    <View style={generalStyle.stripHeader}>
      <View style={generalStyle.stripAccent} />
      <Text style={[generalStyle.stripTitle, { color: isDark ? "#c8e6c9" : PRIMARY }]}>
        Recently Listed
      </Text>
    </View>
    <FlatList
      data={items}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={(it, i) => `si_${it.id}_${i}`}
      contentContainerStyle={generalStyle.stripList}
      renderItem={({ item }) => (
        <Pressable
          onPress={() => onPress(item.id)}
          style={[generalStyle.stripCard, {
            backgroundColor: theme.sectionBackground,
            borderColor: isDark ? PRIMARY_DARK : "#c8e6c9",
          }]}
        >
          <Image
            source={item.pImage ? { uri: item.pImage } : require("../../assets/images/HomeScreen/nike.png")}
            style={generalStyle.stripImg}
            resizeMode="cover"
          />
          <View style={generalStyle.stripCardInfo}>
            <Text numberOfLines={1} style={[generalStyle.stripCardName, { color: theme.text }]}>
              {item.pName}
            </Text>
            <Text style={[generalStyle.stripCardPrice, { color: PRIMARY }]}>
              ₦{Number(item.pAmount).toLocaleString()}
            </Text>
          </View>
        </Pressable>
      )}
    />
  </View>
), (p, n) => p.isDark === n.isDark && p.items === n.items);

export const GridBlockView = React.memo(({
  items, isDark, theme, onPress,
}: {
  items: RecentListingItem[];
  isDark: boolean;
  theme: typeof Colors.light;
  onPress: (id: string) => void;
}) => {
  const pairs: [RecentListingItem, RecentListingItem | null][] = [];
  for (let i = 0; i < items.length; i += 2) {
    pairs.push([items[i], items[i + 1] ?? null]);
  }

  console.log("Rendering GridBlockView with items:", items.map(it => it.id));

  return (
    <View style={generalStyle.gridBlock}>
      {pairs.map((pair, rowIdx) => (
        <View key={`row_${rowIdx}`} style={generalStyle.gridRow}>
          <ProductCard
            item={pair[0]} isDark={isDark} theme={theme}
            onPress={() => onPress(pair[0].id)}
          />
          {pair[1] ? (
            <ProductCard
              item={pair[1]} isDark={isDark} theme={theme}
              onPress={() => onPress(pair[1]!.id)}
            />
          ) : (
            <View style={generalStyle.cardPlaceholder} />
          )}
        </View>
      ))}
    </View>
  );
}, (p, n) => p.isDark === n.isDark && p.items === n.items);


