import SectionTitle from "../SectionTitle";
import SingleFeature from "./SingleFeature";
import featuresData from "./featuresData";

const Features = () => {
  return (
    <section className="pb-8 pt-20 bg-blue-100 dark:bg-dark pl-20 lg:pb-[70px] lg:pt-[120px]">
      <div className="container">
        <SectionTitle
          title="Main Features Of FinFlow"
          paragraph="Supports a wide range of investment types, including stocks, mutual funds, and cryptocurrencies."
        />

        <div className="-mx-4 mt-12 flex flex-wrap lg:mt-20">
          {featuresData.map((feature, i) => (
            <SingleFeature key={i} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
